/**
 * SmartNeighborhoodCard
 *
 * Carte intelligente de quartier — s'affiche automatiquement dans l'onglet
 * Description de chaque fiche propriété. Elle synthétise en un coup d'œil :
 *   • Score de sécurité du quartier
 *   • Proximité des services essentiels (écoles, hôpitaux, commerces, transports)
 *   • Analyse de trafic / accessibilité
 *   • Prix moyen de la zone (location & vente)
 *
 * Sources de données (architecture actuelle — toutes offline-first) :
 *   • proximityScore   : calculé par le backend depuis OpenStreetMap Overpass API
 *   • distanceToAmenities : distances en mètres depuis les coordonnées GPS du bien
 *   • Sécurité         : score synthétique 0-10 passé dans `item.securityScore`
 *   • Prix zone        : agrégat MongoDB sur rayon 1 km autour du bien
 *
 * Technologies recommandées (production) :
 *   • react-native-maps  : polygones de zones de prix + marqueurs POI
 *   • OpenStreetMap Nominatim / Overpass : POI gratuits, sans clé
 *   • Google Maps Platform (Places API) : si accès premium
 *   • Mapbox GL         : heatmaps de prix et de sécurité (vector tiles)
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';

// ── Enable LayoutAnimation on Android ─────────────────────────────────────────
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface NeighborhoodData {
  /** Score sécurité 0–10 (10 = très sûr) */
  securityScore?: number;
  /** Prix moyen location €/m² ou XAF/m² dans un rayon de 1 km */
  avgRentPricePerM2?: number;
  /** Prix moyen vente €/m² ou XAF/m² */
  avgSalePricePerM2?: number;
  /** Monnaie utilisée pour les prix */
  currency?: string;
  /** Distances en mètres aux services essentiels */
  distanceToAmenities?: {
    schools?:    number;
    healthcare?: number;
    shopping?:   number;
    transport?:  number;
  };
  /** Score proximité 0–10 par catégorie */
  proximityScore?: {
    transport?: number;
    schools?:   number;
    healthcare?: number;
    shopping?:  number;
  };
  /** Temps de trajet estimé (minutes) depuis le bien */
  travelTimes?: {
    cityCenter?: number;
    airport?:    number;
    highway?:    number;
  };
  /** Niveau de congestion : low | medium | high */
  trafficLevel?: 'low' | 'medium' | 'high';
}

interface SmartNeighborhoodCardProps {
  item: any; // extendedItemTypes — données propriété complètes
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDistance = (meters?: number): string => {
  if (meters == null || meters <= 0) return '–';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatPrice = (price?: number, currency?: string): string => {
  if (!price || price <= 0) return '–';
  const c = currency ?? 'XAF';
  if (c === 'XAF') return `${(price / 1000).toFixed(0)}K XAF/m²`;
  return `${price.toFixed(0)} ${c}/m²`;
};

/** Traduit un score 0–10 en label + couleur */
const scoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 8) return { label: 'Excellent',  color: '#10B981' };
  if (score >= 6) return { label: 'Bon',         color: '#3B82F6' };
  if (score >= 4) return { label: 'Moyen',       color: '#F59E0B' };
  return            { label: 'Faible',        color: '#EF4444' };
};

const trafficColors: Record<string, string> = {
  low:    '#10B981',
  medium: '#F59E0B',
  high:   '#EF4444',
};

const trafficLabels: Record<string, string> = {
  low:    'Fluide',
  medium: 'Modéré',
  high:   'Chargé',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

interface ScoreBarProps {
  score: number; // 0–10
  color: string;
}
const ScoreBar = ({ score, color }: ScoreBarProps) => (
  <View style={styles.scoreBarTrack}>
    <View
      style={[
        styles.scoreBarFill,
        { width: `${Math.min(score * 10, 100)}%` as any, backgroundColor: color },
      ]}
    />
  </View>
);

interface AmenityRowProps {
  icon:      string;
  iconLib:   'MaterialCommunityIcons' | 'Ionicons';
  label:     string;
  distance?: number;
  score?:    number;
  color:     string;
}
const AmenityRow = ({ icon, iconLib, label, distance, score, color }: AmenityRowProps) => {
  const IconComp = iconLib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
  const displayScore = score ?? 0;
  const { label: sl, color: sc } = scoreLabel(displayScore);

  return (
    <View style={styles.amenityRow}>
      <View style={[styles.amenityIconWrap, { backgroundColor: color + '18' }]}>
        <IconComp name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.amenityInfo}>
        <ThemedText style={styles.amenityLabel}>{label}</ThemedText>
        <View style={styles.amenityMeta}>
          {distance != null && distance > 0 && (
            <ThemedText style={styles.amenityDistance}>{formatDistance(distance)}</ThemedText>
          )}
          {score != null && (
            <View style={[styles.scorePill, { backgroundColor: sc + '20' }]}>
              <ThemedText style={[styles.scorePillText, { color: sc }]}>{sl}</ThemedText>
            </View>
          )}
        </View>
        <ScoreBar score={displayScore} color={sc} />
      </View>
    </View>
  );
};

// ── Geocoding + Overpass API ──────────────────────────────────────────────────

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/** Geocode an address string → { lat, lon } via Nominatim */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address) return null;
  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'EasyRent/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

/** Distance in metres between two GPS points (Haversine) */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Convert nearest-POI distance (metres) to a 0-10 proximity score */
function distanceToScore(metres: number): number {
  if (metres <= 200)  return 10;
  if (metres <= 500)  return 8;
  if (metres <= 1000) return 6;
  if (metres <= 2000) return 4;
  if (metres <= 4000) return 2;
  return 1;
}

interface FetchedNeighborhood {
  distanceToAmenities: { schools: number | null; healthcare: number | null; shopping: number | null; transport: number | null };
  proximityScore:      { schools: number | null; healthcare: number | null; shopping: number | null; transport: number | null };
}

async function fetchNeighborhoodFromOverpass(lat: number, lon: number): Promise<FetchedNeighborhood> {
  const r = 2000; // search radius metres
  const query = `
[out:json][timeout:15];
(
  node["amenity"~"school|university|college"](around:${r},${lat},${lon});
  node["amenity"~"hospital|clinic|pharmacy|doctors"](around:${r},${lat},${lon});
  node["shop"](around:${r},${lat},${lon});
  node["amenity"="marketplace"](around:${r},${lat},${lon});
  node["public_transport"~"stop_position|platform"](around:${r},${lat},${lon});
  node["highway"="bus_stop"](around:${r},${lat},${lon});
  node["railway"~"station|halt|tram_stop"](around:${r},${lat},${lon});
);
out body;
`;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error('Overpass request failed');
  const json = await res.json();
  const elements: any[] = json.elements ?? [];

  const nearest = (tags: string[]): number | null => {
    let best: number | null = null;
    for (const el of elements) {
      const t = el.tags ?? {};
      const matches = tags.some(k => {
        const [key, val] = k.split('=');
        return val ? t[key] === val : t[key] != null;
      });
      if (!matches) continue;
      const d = haversine(lat, lon, el.lat, el.lon);
      if (best === null || d < best) best = d;
    }
    return best;
  };

  const dSchool    = nearest(['amenity=school', 'amenity=university', 'amenity=college']);
  const dHealth    = nearest(['amenity=hospital', 'amenity=clinic', 'amenity=pharmacy', 'amenity=doctors']);
  const dShop      = nearest(['shop', 'amenity=marketplace']);
  const dTransport = nearest(['public_transport', 'highway=bus_stop', 'railway']);

  return {
    distanceToAmenities: {
      schools:    dSchool    != null ? Math.round(dSchool)    : null,
      healthcare: dHealth    != null ? Math.round(dHealth)    : null,
      shopping:   dShop      != null ? Math.round(dShop)      : null,
      transport:  dTransport != null ? Math.round(dTransport) : null,
    },
    proximityScore: {
      schools:    dSchool    != null ? distanceToScore(dSchool)    : null,
      healthcare: dHealth    != null ? distanceToScore(dHealth)    : null,
      shopping:   dShop      != null ? distanceToScore(dShop)      : null,
      transport:  dTransport != null ? distanceToScore(dTransport) : null,
    },
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────

const SmartNeighborhoodCard = ({ item }: SmartNeighborhoodCardProps) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [liveData, setLiveData] = useState<FetchedNeighborhood | null>(null);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const fetchedRef = useRef(false);

  // GPS coords — from property directly, or geocoded from address
  const staticLat = item.coordinates?.latitude  ?? item.location?.latitude  ?? null;
  const staticLon = item.coordinates?.longitude ?? item.location?.longitude ?? null;
  const lat = resolvedCoords?.lat ?? staticLat;
  const lon = resolvedCoords?.lon ?? staticLon;

  // Step 1: If no coords, geocode the address via Nominatim (once on mount)
  const geocodedRef = useRef(false);
  useEffect(() => {
    if (geocodedRef.current || staticLat != null) return; // already have coords
    const address = item.address || item.location || '';
    if (!address) return;
    geocodedRef.current = true;
    geocodeAddress(address).then(coords => {
      if (coords) setResolvedCoords(coords);
    });
  }, [staticLat, item.address, item.location]);

  // Step 2: Fetch POI from Overpass when card is expanded AND coords are ready
  // Runs whenever expanded becomes true OR coords arrive (whichever is last)
  useEffect(() => {
    if (!expanded || fetchedRef.current || lat == null || lon == null) return;
    fetchedRef.current = true;
    setFetching(true);
    fetchNeighborhoodFromOverpass(lat, lon)
      .then(data => setLiveData(data))
      .catch(() => { /* silently ignore */ })
      .finally(() => setFetching(false));
  }, [expanded, lat, lon]); // lat/lon change when geocoding resolves → triggers fetch

  // Merge static item data with live-fetched Overpass data
  const nd: NeighborhoodData = useMemo(() => {
    const live = liveData;
    return {
      securityScore:       item.securityScore       ?? item.neighborhoodScore ?? null,
      avgRentPricePerM2:   item.avgRentPricePerM2   ?? null,
      avgSalePricePerM2:   item.avgSalePricePerM2   ?? null,
      currency:            item.ownerCriteria?.currency ?? item.currency ?? 'XAF',
      distanceToAmenities: item.distanceToAmenities ?? live?.distanceToAmenities ?? null,
      proximityScore:      item.proximityScore      ?? live?.proximityScore      ?? null,
      travelTimes:         item.travelTimes         ?? null,
      trafficLevel:        item.trafficLevel         ?? null,
    };
  }, [item, liveData]);

  // Show the card if we have coords, an address to geocode, or any static scores
  const hasAddress = !!(item.address || item.location);
  const hasData = useMemo(() => {
    return (
      lat != null ||
      hasAddress ||
      nd.securityScore != null ||
      nd.proximityScore != null ||
      nd.avgRentPricePerM2 != null ||
      nd.trafficLevel != null ||
      (nd.distanceToAmenities && Object.values(nd.distanceToAmenities).some(v => v != null && v > 0))
    );
  }, [lat, hasAddress, nd]);

  // ── No-data fallback: show card header + placeholder ─────────────────────
  if (!hasData) {
    return (
      <ThemedView style={[styles.card, { borderColor: theme.outline + '30' }]}>
        <View style={styles.header}>
          <View style={[styles.headerIconWrap, { backgroundColor: theme.primary + '18' }]}>
            <MaterialCommunityIcons name="map-marker-radius" size={22} color={theme.primary} />
          </View>
          <View style={styles.headerTextWrap}>
            <ThemedText style={styles.headerTitle}>Analyse du quartier</ThemedText>
            <View style={[styles.globalBadge, { backgroundColor: theme.outline + '18' }]}>
              <ThemedText style={[styles.globalBadgeText, { color: theme.onSurface + '80' }]}>
                Données en cours de collecte…
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.noDataBody}>
          <MaterialCommunityIcons name="map-clock-outline" size={40} color={theme.primary + '60'} />
          <ThemedText style={[styles.noDataText, { color: theme.onSurface + '70' }]}>
            L'analyse de ce quartier sera disponible prochainement.{'\n'}
            Les scores (sécurité, commodités, trafic) sont calculés depuis les données OpenStreetMap.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  const secScore    = nd.securityScore ?? 0;
  const { label: secLabel, color: secColor } = scoreLabel(secScore);
  const tColor = nd.trafficLevel ? trafficColors[nd.trafficLevel] : theme.primary;
  const tLabel = nd.trafficLevel ? trafficLabels[nd.trafficLevel] : null;

  // Score global quartier = moyenne des scores disponibles
  const scores: number[] = [];
  if (nd.securityScore != null)            scores.push(nd.securityScore);
  if (nd.proximityScore?.transport != null) scores.push(nd.proximityScore.transport);
  if (nd.proximityScore?.schools != null)   scores.push(nd.proximityScore.schools);
  if (nd.proximityScore?.healthcare != null) scores.push(nd.proximityScore.healthcare);
  if (nd.proximityScore?.shopping != null)  scores.push(nd.proximityScore.shopping);
  const globalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const globalInfo = globalScore != null ? scoreLabel(globalScore) : null;

  return (
    <ThemedView style={[styles.card, { borderColor: theme.outline + '30' }]}>

      {/* ── Header ── */}
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.8} style={styles.header}>
        <View style={[styles.headerIconWrap, { backgroundColor: theme.primary + '18' }]}>
          <MaterialCommunityIcons name="map-marker-radius" size={22} color={theme.primary} />
        </View>
        <View style={styles.headerTextWrap}>
          <ThemedText style={styles.headerTitle}>Analyse du quartier</ThemedText>
          {globalInfo && (
            <View style={[styles.globalBadge, { backgroundColor: globalInfo.color + '20' }]}>
              <ThemedText style={[styles.globalBadgeText, { color: globalInfo.color }]}>
                {globalInfo.label} · {globalScore!.toFixed(1)}/10
              </ThemedText>
            </View>
          )}
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={theme.onSurface + '60'}
        />
      </TouchableOpacity>

      {/* ── Quick scores row (always visible) ── */}
      <View style={styles.quickRow}>
        {nd.securityScore != null && (
          <QuickScore icon="shield-check" label="Sécurité" score={nd.securityScore} />
        )}
        {nd.proximityScore?.transport != null && (
          <QuickScore icon="bus" label="Transport" score={nd.proximityScore.transport} />
        )}
        {nd.proximityScore?.schools != null && (
          <QuickScore icon="school" label="Écoles" score={nd.proximityScore.schools} />
        )}
        {nd.proximityScore?.healthcare != null && (
          <QuickScore icon="hospital-box" label="Santé" score={nd.proximityScore.healthcare} />
        )}
        {nd.proximityScore?.shopping != null && (
          <QuickScore icon="shopping" label="Commerces" score={nd.proximityScore.shopping} />
        )}
        {/* Hint shown before first fetch when no static scores yet */}
        {!nd.proximityScore && !nd.securityScore && !expanded && (lat != null || hasAddress) && (
          <ThemedText style={[styles.tapHint, { color: theme.onSurface + '60' }]}>
            Appuyez pour analyser ce quartier
          </ThemedText>
        )}
      </View>

      {/* ── Expanded detail ── */}
      {expanded && (
        <View style={styles.detail}>
          {fetching && (
            <View style={styles.fetchingRow}>
              <ActivityIndicator size="small" color={theme.primary} />
              <ThemedText style={[styles.fetchingText, { color: theme.onSurface + '80' }]}>
                Analyse du quartier en cours…
              </ThemedText>
            </View>
          )}

          {/* Sécurité */}
          {nd.securityScore != null && (
            <View style={styles.detailSection}>
              <SectionLabel icon="shield-check-outline" label="Sécurité du quartier" color="#10B981" />
              <View style={styles.securityRow}>
                <View style={[styles.securityBadge, { backgroundColor: secColor + '18' }]}>
                  <MaterialCommunityIcons name="shield-check" size={28} color={secColor} />
                  <ThemedText style={[styles.securityScore, { color: secColor }]}>
                    {secScore.toFixed(1)}
                  </ThemedText>
                  <ThemedText style={[styles.securityLabel, { color: secColor }]}>{secLabel}</ThemedText>
                </View>
                <View style={styles.securityDesc}>
                  <ThemedText style={styles.detailBody}>
                    {secScore >= 8
                      ? 'Quartier très sûr. Faible criminalité signalée. Idéal pour les familles.'
                      : secScore >= 6
                      ? 'Quartier globalement sûr. Criminalité dans la moyenne.'
                      : secScore >= 4
                      ? 'Quartier à surveiller. Quelques incidents signalés.'
                      : 'Quartier sensible. Renseignez-vous auprès des riverains.'}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Services essentiels */}
          {nd.proximityScore && (
            <View style={styles.detailSection}>
              <SectionLabel icon="map-marker-multiple" label="Services essentiels" color="#3B82F6" />
              <View style={styles.amenitiesList}>
                {nd.proximityScore.schools != null && (
                  <AmenityRow
                    icon="school"
                    iconLib="MaterialCommunityIcons"
                    label="Écoles & universités"
                    distance={nd.distanceToAmenities?.schools}
                    score={nd.proximityScore.schools}
                    color="#8B5CF6"
                  />
                )}
                {nd.proximityScore.healthcare != null && (
                  <AmenityRow
                    icon="hospital-box"
                    iconLib="MaterialCommunityIcons"
                    label="Hôpitaux & cliniques"
                    distance={nd.distanceToAmenities?.healthcare}
                    score={nd.proximityScore.healthcare}
                    color="#EF4444"
                  />
                )}
                {nd.proximityScore.shopping != null && (
                  <AmenityRow
                    icon="shopping"
                    iconLib="MaterialCommunityIcons"
                    label="Commerces & marchés"
                    distance={nd.distanceToAmenities?.shopping}
                    score={nd.proximityScore.shopping}
                    color="#F59E0B"
                  />
                )}
                {nd.proximityScore.transport != null && (
                  <AmenityRow
                    icon="bus-clock"
                    iconLib="MaterialCommunityIcons"
                    label="Transports en commun"
                    distance={nd.distanceToAmenities?.transport}
                    score={nd.proximityScore.transport}
                    color="#3B82F6"
                  />
                )}
              </View>
            </View>
          )}

          {/* Trafic & accessibilité */}
          {(nd.trafficLevel || nd.travelTimes) && (
            <View style={styles.detailSection}>
              <SectionLabel icon="traffic-light" label="Trafic & accessibilité" color="#F59E0B" />
              <View style={styles.trafficRow}>
                {nd.trafficLevel && (
                  <View style={[styles.trafficBadge, { backgroundColor: tColor + '18', borderColor: tColor + '40' }]}>
                    <MaterialCommunityIcons name="traffic-light" size={20} color={tColor} />
                    <ThemedText style={[styles.trafficLabel, { color: tColor }]}>
                      Trafic {tLabel}
                    </ThemedText>
                  </View>
                )}
                {nd.travelTimes && (
                  <View style={styles.travelGrid}>
                    {nd.travelTimes.cityCenter != null && (
                      <TravelPill icon="city" label="Centre-ville" minutes={nd.travelTimes.cityCenter} />
                    )}
                    {nd.travelTimes.airport != null && (
                      <TravelPill icon="airplane" label="Aéroport" minutes={nd.travelTimes.airport} />
                    )}
                    {nd.travelTimes.highway != null && (
                      <TravelPill icon="road" label="Autoroute" minutes={nd.travelTimes.highway} />
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Prix moyens de la zone */}
          {(nd.avgRentPricePerM2 != null || nd.avgSalePricePerM2 != null) && (
            <View style={styles.detailSection}>
              <SectionLabel icon="home-analytics" label="Prix moyens de la zone" color="#10B981" />
              <View style={styles.priceRow}>
                {nd.avgRentPricePerM2 != null && (
                  <PricePill
                    icon="key"
                    label="Location moy."
                    value={formatPrice(nd.avgRentPricePerM2, nd.currency)}
                    color="#3B82F6"
                  />
                )}
                {nd.avgSalePricePerM2 != null && (
                  <PricePill
                    icon="home-city"
                    label="Achat moy."
                    value={formatPrice(nd.avgSalePricePerM2, nd.currency)}
                    color="#10B981"
                  />
                )}
              </View>
              <ThemedText style={[styles.dataNote, { color: theme.onSurface + '50' }]}>
                * Données agrégées dans un rayon de 1 km autour du bien
              </ThemedText>
            </View>
          )}

          {/* Sources */}
          <View style={[styles.sourceNote, { borderTopColor: theme.outline + '20' }]}>
            <MaterialCommunityIcons name="information-outline" size={14} color={theme.onSurface + '50'} />
            <ThemedText style={[styles.sourceText, { color: theme.onSurface + '50' }]}>
              Données : OpenStreetMap · Scores calculés par EasyRent
            </ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
};

// ── Small sub-components ───────────────────────────────────────────────────────

interface QuickScoreProps { icon: string; label: string; score: number }
const QuickScore = ({ icon, label, score }: QuickScoreProps) => {
  const { color } = scoreLabel(score);
  return (
    <View style={styles.quickItem}>
      <View style={[styles.quickIconWrap, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon as any} size={16} color={color} />
      </View>
      <ThemedText style={styles.quickLabel}>{label}</ThemedText>
      <ThemedText style={[styles.quickScore, { color }]}>{score.toFixed(0)}</ThemedText>
    </View>
  );
};

interface SectionLabelProps { icon: string; label: string; color: string }
const SectionLabel = ({ icon, label, color }: SectionLabelProps) => (
  <View style={styles.sectionLabelRow}>
    <MaterialCommunityIcons name={icon as any} size={16} color={color} />
    <ThemedText style={[styles.sectionLabelText, { color }]}>{label}</ThemedText>
  </View>
);

interface TravelPillProps { icon: string; label: string; minutes: number }
const TravelPill = ({ icon, label, minutes }: TravelPillProps) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.travelPill, { backgroundColor: theme.surfaceVariant }]}>
      <MaterialCommunityIcons name={icon as any} size={14} color={theme.onSurface + '80'} />
      <View>
        <ThemedText style={styles.travelPillLabel}>{label}</ThemedText>
        <ThemedText style={styles.travelPillTime}>{minutes} min</ThemedText>
      </View>
    </View>
  );
};

interface PricePillProps { icon: string; label: string; value: string; color: string }
const PricePill = ({ icon, label, value, color }: PricePillProps) => (
  <View style={[styles.pricePill, { backgroundColor: color + '12', borderColor: color + '30' }]}>
    <MaterialCommunityIcons name={icon as any} size={16} color={color} />
    <View>
      <ThemedText style={[styles.pricePillLabel, { color: color + 'CC' }]}>{label}</ThemedText>
      <ThemedText style={[styles.pricePillValue, { color }]}>{value}</ThemedText>
    </View>
  </View>
);

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  headerIconWrap: {
    borderRadius: 10,
    padding: 8,
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  globalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  globalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Quick row
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  quickItem: {
    alignItems: 'center',
    gap: 3,
    minWidth: 52,
  },
  quickIconWrap: {
    borderRadius: 20,
    padding: 7,
  },
  quickLabel: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  quickScore: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Detail
  detail: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 16,
  },
  detailSection: {
    gap: 10,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabelText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailBody: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.8,
  },

  // Security
  securityRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  securityBadge: {
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 4,
    minWidth: 80,
  },
  securityScore: {
    fontSize: 22,
    fontWeight: '800',
  },
  securityLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  securityDesc: {
    flex: 1,
    justifyContent: 'center',
  },

  // Amenities
  amenitiesList: {
    gap: 10,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  amenityIconWrap: {
    borderRadius: 10,
    padding: 8,
    marginTop: 2,
  },
  amenityInfo: {
    flex: 1,
    gap: 4,
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  amenityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityDistance: {
    fontSize: 12,
    opacity: 0.6,
  },
  scorePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scorePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scoreBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Traffic
  trafficRow: {
    gap: 10,
  },
  trafficBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  trafficLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  travelGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  travelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  travelPillLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  travelPillTime: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Prices
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: 130,
  },
  pricePillLabel: {
    fontSize: 11,
  },
  pricePillValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  dataNote: {
    fontSize: 10,
    fontStyle: 'italic',
  },

  // Source
  noDataBody: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  noDataText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  fetchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  fetchingText: {
    fontSize: 13,
  },
  tapHint: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  sourceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sourceText: {
    fontSize: 11,
  },
});

export default SmartNeighborhoodCard;
