import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
  Modal,
  View,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import signatureService, { ContractDetail } from '@/services/api/signatureService';
import { getAuthToken } from '@/hooks/useAuthToken';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width - 32;
const CANVAS_HEIGHT = 160;

interface Point { x: number; y: number; }
interface Stroke { points: Point[]; }

const STEPS = ['Lire', 'Signer', 'Confirmer'];

export default function SignatureScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { contractId } = useLocalSearchParams<{ contractId?: string }>();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedClause, setExpandedClause] = useState<number | null>(0);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [signedAt, setSignedAt] = useState<string>('');
  const [signRef, setSignRef] = useState<string>('');

  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Load contract if contractId passed as route param
  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    getAuthToken().then(token => {
      if (!token) { setLoading(false); return; }
      signatureService.getContractForSigning(token, contractId)
        .then(res => setContract(res.contract))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [contractId]);

  // Mock contract for demo (used when no contractId param)
  const doc = contract || {
    id: contractId || 'demo',
    reference: 'CB-2026-04-00142',
    title: 'Contrat de Bail d\'Habitation',
    status: 'PENDING_SIGNATURE' as const,
    owner: 'Jean Mbarga',
    tenant: (user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : 'Marie Foning',
    property: 'Appartement 3P — Résidence Les Acacias, Bvd de la Liberté, Douala',
    startDate: '1er Mai 2026',
    duration: '12 mois',
    rent: '165 000 XAF / mois',
    deposit: '330 000 XAF',
    createdAt: new Date().toISOString(),
    clauses: [
      { title: 'Article 1 — Objet', content: 'Le présent contrat a pour objet la location d\'un appartement meublé de type 3 pièces situé résidence Les Acacias, boulevard de la Liberté, Douala.' },
      { title: 'Article 2 — Durée', content: 'Le bail est conclu pour une durée de 12 mois à compter du 1er Mai 2026. Il se renouvellera tacitement sauf dénonciation par l\'une des parties.' },
      { title: 'Article 3 — Loyer', content: 'Le loyer mensuel est fixé à 165 000 XAF, payable le 1er de chaque mois. Tout retard de paiement entraîne une pénalité de 1% par jour.' },
      { title: 'Article 4 — Dépôt de garantie', content: 'Un dépôt de garantie de 330 000 XAF (2 mois de loyer) est versé à la signature du présent contrat.' },
      { title: 'Article 5 — Obligations du locataire', content: 'Le locataire s\'engage à maintenir le bien en bon état, à ne pas sous-louer sans accord écrit du propriétaire, et à respecter le règlement de copropriété.' },
    ],
  };

  const hasSignature = strokes.length > 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setCurrentStroke([{ x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY }]);
        setIsSigning(true);
      },
      onPanResponderMove: (evt) => {
        setCurrentStroke(prev => [...prev, { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY }]);
      },
      onPanResponderRelease: () => {
        setStrokes(prev => [...prev, { points: currentStroke }]);
        setCurrentStroke([]);
        setIsSigning(false);
      },
    })
  ).current;

  const clearSignature = () => { setStrokes([]); setCurrentStroke([]); };

  const handleSign = useCallback(async () => {
    if (!hasSignature || !agreed) return;
    setSubmitting(true);
    try {
      // Convert strokes to a simple SVG path string as the "signature data"
      const sigData = JSON.stringify(strokes.map(s => s.points));
      const signerName = (user as any)?.firstName
        ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim()
        : doc.tenant;

      const token = await getAuthToken();
      if (token && doc.id !== 'demo') {
        const result = await signatureService.signContract(token, doc.id, {
          signatureDataUri: sigData,
          signerName,
          deviceInfo: 'EasyRent Mobile App',
        });
        setSignedAt(result.signedAt);
        setSignRef(result.reference);
      } else {
        // Demo mode
        setSignedAt(new Date().toISOString());
        setSignRef(doc.reference);
      }

      setCurrentStep(2);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50 }).start();
      setTimeout(() => setShowSuccess(true), 300);
    } catch (err: any) {
      Alert.alert('Erreur de signature', err.message || 'Impossible de signer le contrat');
    } finally {
      setSubmitting(false);
    }
  }, [hasSignature, agreed, strokes, doc, user, scaleAnim]);

  const allStrokes = [...strokes, ...(currentStroke.length > 0 ? [{ points: currentStroke }] : [])];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.[0] || theme.surface }}>
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.[0] || theme.surface }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>Signature Électronique</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 11 }}>Document légalement certifié</ThemedText>
        </ThemedView>
        <MaterialCommunityIcons name="shield-check" size={22} color="#10B981" />
      </ThemedView>

      {/* Step Indicator */}
      <ThemedView style={[s.steps, { backgroundColor: theme.surface, borderBottomColor: theme.outline + '15' }]}>
        {STEPS.map((step, i) => (
          <ThemedView key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <ThemedView style={[s.stepDot, {
              backgroundColor: i <= currentStep ? theme.primary : theme.outline + '30',
              borderColor: i === currentStep ? theme.primary : 'transparent',
            }]}>
              {i < currentStep
                ? <Ionicons name="checkmark" size={12} color="#fff" />
                : <ThemedText type="body" style={{ color: i <= currentStep ? '#fff' : theme.onSurface + '50', fontSize: 11, fontWeight: '700' }}>{i + 1}</ThemedText>
              }
            </ThemedView>
            <ThemedText type="body" style={{ color: i <= currentStep ? theme.primary : theme.onSurface + '40', fontSize: 11, fontWeight: i === currentStep ? '700' : '500' }}>
              {step}
            </ThemedText>
            {i < STEPS.length - 1 && (
              <ThemedView style={[s.stepLine, { backgroundColor: i < currentStep ? theme.primary : theme.outline + '25', position: 'absolute', right: -(width / 6), top: 12 }]} />
            )}
          </ThemedView>
        ))}
      </ThemedView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* Document Info Card */}
        <ThemedView style={[s.docCard, { backgroundColor: theme.surface, borderColor: theme.outline + '25' }]}>
          <ThemedView style={[s.row, { gap: 10 }]}>
            <ThemedView style={[s.docIcon, { backgroundColor: theme.primary + '15' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.primary} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', fontSize: 15 }}>{doc.title}</ThemedText>
              <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>Réf. {doc.reference}</ThemedText>
            </ThemedView>
          </ThemedView>

          {[
            { label: 'Propriétaire', value: doc.owner, icon: 'person' },
            { label: 'Locataire', value: doc.tenant, icon: 'person-outline' },
            { label: 'Bien', value: doc.property, icon: 'home-outline' },
            { label: 'Date début', value: doc.startDate, icon: 'calendar-outline' },
            { label: 'Durée', value: doc.duration, icon: 'time-outline' },
            { label: 'Loyer', value: doc.rent, icon: 'cash-outline' },
            { label: 'Caution', value: doc.deposit, icon: 'shield-outline' },
          ].map((row, i) => (
            <ThemedView key={i} style={[s.row, { gap: 10 }]}>
              <Ionicons name={row.icon as any} size={14} color={theme.onSurface + '50'} />
              <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12, width: 90 }}>{row.label}:</ThemedText>
              <ThemedText type="body" style={{ color: theme.text, fontSize: 12, fontWeight: '600', flex: 1 }}>{row.value}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Clauses */}
        <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700' }}>Clauses du contrat</ThemedText>
        {doc.clauses.map((clause, i) => (
          <ThemedView key={i} style={[s.clauseCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <TouchableOpacity style={[s.row, { justifyContent: 'space-between' }]} onPress={() => setExpandedClause(expandedClause === i ? null : i)}>
              <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', fontSize: 13, flex: 1 }}>{clause.title}</ThemedText>
              <Ionicons name={expandedClause === i ? 'chevron-up' : 'chevron-down'} size={16} color={theme.onSurface + '60'} />
            </TouchableOpacity>
            {expandedClause === i && (
              <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 12, lineHeight: 18, marginTop: 8 }}>
                {clause.content}
              </ThemedText>
            )}
          </ThemedView>
        ))}

        {/* Legal badges */}
        <ThemedView style={[s.row, { gap: 8, flexWrap: 'wrap' }]}>
          {[
            { label: 'SSL 256-bit', icon: 'lock-closed', color: '#10B981' },
            { label: 'eIDAS conforme', icon: 'shield-checkmark', color: '#6366F1' },
            { label: 'Horodatage certifié', icon: 'time', color: '#F59E0B' },
          ].map((badge, i) => (
            <ThemedView key={i} style={[s.row, { gap: 4, backgroundColor: badge.color + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }]}>
              <Ionicons name={badge.icon as any} size={12} color={badge.color} />
              <ThemedText type="body" style={{ color: badge.color, fontSize: 11, fontWeight: '700' }}>{badge.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Step 1 — Proceed to signing */}
        {currentStep === 0 && (
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setCurrentStep(1)}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
            <ThemedText type="body" style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Procéder à la signature</ThemedText>
          </TouchableOpacity>
        )}

        {/* Step 2 — Signature Canvas */}
        {currentStep === 1 && (
          <>
            <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700' }}>Votre signature</ThemedText>
            <ThemedView style={[s.canvasContainer, { backgroundColor: theme.surface, borderColor: theme.primary + '40' }]}>
              <View
                style={[s.canvas, { backgroundColor: '#f8f8f8' }]}
                {...panResponder.panHandlers}
              >
                <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
                  {allStrokes.map((stroke, si) =>
                    stroke.points.length > 1 ? (
                      <SvgPath
                        key={si}
                        d={strokeToPath(stroke.points)}
                        stroke={theme.primary}
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null
                  )}
                </Svg>
                {!hasSignature && !isSigning && (
                  <ThemedView style={s.canvasPlaceholder}>
                    <Ionicons name="pencil-outline" size={28} color={theme.onSurface + '30'} />
                    <ThemedText type="body" style={{ color: theme.onSurface + '35', fontSize: 13 }}>
                      Signez ici avec votre doigt
                    </ThemedText>
                  </ThemedView>
                )}
              </View>
              <TouchableOpacity
                style={[s.clearBtn, { borderColor: theme.outline + '40' }]}
                onPress={clearSignature}
              >
                <Ionicons name="trash-outline" size={16} color={theme.onSurface + '60'} />
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>Effacer</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {/* Agreement checkbox */}
            <TouchableOpacity style={[s.row, { gap: 12 }]} onPress={() => setAgreed(!agreed)}>
              <ThemedView style={[s.checkbox, {
                backgroundColor: agreed ? theme.primary : 'transparent',
                borderColor: agreed ? theme.primary : theme.outline + '60',
              }]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </ThemedView>
              <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 12, flex: 1, lineHeight: 17 }}>
                Je certifie avoir lu et accepté l'intégralité du contrat. Cette signature électronique a la même valeur légale qu'une signature manuscrite.
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.primaryBtn, {
                backgroundColor: hasSignature && agreed ? theme.primary : theme.outline + '30',
              }]}
              onPress={handleSign}
              disabled={!hasSignature || !agreed || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <ThemedText type="body" style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                    {hasSignature && agreed ? 'Confirmer la signature' : 'Signer puis confirmer'}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <ThemedView style={s.successBackdrop}>
          <Animated.View style={[s.successCard, { backgroundColor: theme.surface, transform: [{ scale: scaleAnim }] }]}>
            <ThemedView style={[s.successIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="checkmark-circle" size={56} color="#10B981" />
            </ThemedView>
            <ThemedText type="heading" style={{ color: theme.text, fontWeight: '900', fontSize: 20, textAlign: 'center' }}>
              Contrat signé !
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '70', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
              Votre signature a été enregistrée et certifiée avec succès.
            </ThemedText>

            {[
              { label: 'Référence', value: signRef || doc.reference },
              { label: 'Signé le', value: signedAt ? new Date(signedAt).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR') },
              { label: 'Statut', value: '✅ Légalement valide' },
            ].map((item, i) => (
              <ThemedView key={i} style={[s.successRow, { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + '20' }]}>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{item.label}</ThemedText>
                <ThemedText type="body" style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{item.value}</ThemedText>
              </ThemedView>
            ))}

            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => { setShowSuccess(false); router.back(); }}
            >
              <ThemedText type="body" style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Terminer</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

// ── SVG helpers ──────────────────────────────────────────────────────────────

function strokeToPath(points: Point[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

// Inline minimal SVG renderer using absolute positioned Views
// (avoids react-native-svg dependency requirement)
function Svg({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  return (
    <View style={{ width, height, position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      {children}
    </View>
  );
}

function SvgPath({ d, stroke, strokeWidth }: { d: string; stroke: string; strokeWidth: number; fill: string; strokeLinecap: string; strokeLinejoin: string }) {
  // Parse path and draw line segments as thin Views
  const segments = d.split(' L ');
  const results: React.ReactNode[] = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const from = segments[i].replace('M ', '').split(' ').map(Number);
    const to = segments[i + 1].split(' ').map(Number);
    const [x1, y1] = from;
    const [x2, y2] = to;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    results.push(
      <View
        key={i}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x1,
          top: y1 - strokeWidth / 2,
          width: len,
          height: strokeWidth,
          backgroundColor: stroke,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: '0 50%',
          borderRadius: strokeWidth,
        }}
      />
    );
  }
  return <>{results}</>;
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 4 },
  steps: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  stepLine: { width: 40, height: 2, borderRadius: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  docCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  docIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  clauseCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16 },
  canvasContainer: { borderRadius: 14, borderWidth: 2, overflow: 'hidden' },
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, position: 'relative' },
  canvasPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 6 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderTopWidth: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  successBackdrop: { flex: 1, backgroundColor: '#000000aa', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: { width: '100%', borderRadius: 24, padding: 24, gap: 14, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  successRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, padding: 10 },
});
