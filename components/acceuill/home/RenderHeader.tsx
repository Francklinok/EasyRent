import React, {
  useState, memo, ReactNode, useCallback, useRef, useEffect,
} from "react";
import {
  TouchableOpacity, Animated, StyleSheet, Platform,
  StatusBar, ScrollView, View, Text, Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5,
} from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import { useNotifications } from "@/components/contexts/notifications/NotificationContext";
import NotificationSystem from "@/components/notifications/NotificationSystem";
import { Activity } from "@/services/api/activityService";
import { useTheme } from "@/hooks/themehook";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FilterState {
  priceRange: [number, number];
  propertyType: string | null;
  bedrooms: number | null;
  amenities: string[];
  actionType: "rent" | "sell" | null;
}

export const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 5000000],
  propertyType: null,
  bedrooms: null,
  amenities: [],
  actionType: null,
};

export type HeaderProps = {
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  onTransactionSelect?: (type: "ALL" | "RENT" | "SELL") => void;
  showStatusBar?: boolean;
  statusBarStyle?: "default" | "dark-content" | "light-content";
  backgroundColor?: string;
  userId?: string;
  onActivityPress?: (activity: Activity) => void;
  showActivityIndicator?: boolean;
};

interface Props extends HeaderProps {
  viewType: "grid" | "list";
  setViewType: React.Dispatch<React.SetStateAction<"grid" | "list">>;
  scrollY: Animated.Value;
  totalProperties?: number;
  availableProperties?: number;
  totalServices?: number;
  activeFilterCount?: number;
  onApplyFilters?: (filters: FilterState) => void;
  activeFilters?: FilterState;
}
 
// ─── Constants ────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { key: "house",      label: "Maison",      icon: "home"     },
  { key: "apartment",  label: "Appart.",     icon: "building" },
  { key: "villa",      label: "Villa",       icon: "hotel"    },
  { key: "land",       label: "Terrain",     icon: "map"      },
  { key: "commercial", label: "Commercial",  icon: "store"    },
  { key: "penthouse",  label: "Penthouse",   icon: "home"     },
  { key: "studio",     label: "Studio",      icon: "home"     },
  { key: "loft",       label: "Loft",        icon: "home"     },
  { key: "bureau",     label: "Bureau",      icon: "home"     },
  { key: "chalet",     label: "Chalet",      icon: "home"     },
  { key: "hotel",      label: "Hôtel",       icon: "home"     },
  { key: "terrain",    label: "Terrain",     icon: "home"     },
] as const;

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

const PRICE_STEPS = [0, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000];

const TX_CONFIG = [
  { key: "ALL",  label: "Tout",     icon: "apps-outline"     },
  { key: "RENT", label: "Location", icon: "key-outline"      },
  { key: "SELL", label: "Vente",    icon: "pricetag-outline" },
] as const;

const formatPrice = (p: number) => {
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000)     return `${(p / 1_000).toFixed(0)}K`;
  return `${p}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6)  return "Bonne nuit 🌙";
  if (h < 12) return "Bonjour ☀️";
  if (h < 18) return "Bon après-midi 🌤";
  return "Bonsoir 🌆";
};

// ─── Animated counter ─────────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: value, duration: 900, useNativeDriver: false }).start();
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(id);
  }, [value]);

  return <Text style={[styles.statNum, { color }]}>{display}</Text>;
};

// ─── Stats chips ──────────────────────────────────────────────────────────────
const STATS_META = [
  { icon: "home-city-outline"      as const, label: "Propriétés",  getColor: (t: any) => t.secondary           as string },
  { icon: "check-decagram-outline" as const, label: "Disponibles", getColor: (t: any) => (t.success ?? "#22C55E") as string },
  { icon: "briefcase-outline"      as const, label: "Services",    getColor: (t: any) => (t.star   ?? "#F59E0B") as string },
] as const;

const StatCards: React.FC<{
  totalProperties: number;
  availableProperties: number;
  totalServices: number;
  theme: any;
}> = ({ totalProperties, availableProperties, totalServices, theme }) => {
  const values = [totalProperties, availableProperties, totalServices];
  return (
    <ThemedView style={styles.statsRow}>
      {STATS_META.map((meta, i) => {
        const color = meta.getColor(theme);
        return (
          <MotiView
            key={meta.label}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 55 }}
            style={[styles.statChip, {
              borderColor: color + "35",
              backgroundColor: color + "10",
            }]}
          >
            <MaterialCommunityIcons name={meta.icon} size={16} color={color} />
            <AnimatedCounter value={values[i]} color={theme.text} />
            <ThemedText type = "body" intensity = "light"  style={styles.statChipLabel}>{meta.label}</ThemedText>
          </MotiView>
        );
      })}
    </ThemedView>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const RenderHeader: React.FC<Props> = memo(({
  viewType, setViewType,
  leftElement, rightElement,
  onTransactionSelect,
  showStatusBar = true,
  totalProperties = 0,
  availableProperties = 0,
  totalServices = 0,
  activeFilterCount = 0,
  onApplyFilters,
  activeFilters,
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, addNotification, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTx, setSelectedTx] = useState<"ALL" | "RENT" | "SELL">("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const { theme, isDark } = useTheme();
  const [filters, setFilters] = useState<FilterState>(activeFilters ?? DEFAULT_FILTERS);

  // Logo spring on mount
  const logoRotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(logoRotate, { toValue: 1, stiffness: 120, damping: 14, useNativeDriver: true }).start();
  }, []);
  const logoSpin = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ["-15deg", "0deg"] });

  // Badge pulse
  const badgeScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (unreadCount === 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeScale, { toValue: 1.35, duration: 600, useNativeDriver: true }),
        Animated.timing(badgeScale, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [unreadCount]);

  useEffect(() => {
    (global as any).addGlobalNotification = addNotification;
    return () => { delete (global as any).addGlobalNotification; };
  }, [addNotification]);

  const handleTxSelect = (tx: "ALL" | "RENT" | "SELL") => {
    setSelectedTx(tx);
    onTransactionSelect?.(tx);
  };

  const setPropertyType = useCallback(
    (key: string) => setFilters(p => ({ ...p, propertyType: p.propertyType === key ? null : key })), []
  );
  const setBedrooms = useCallback(
    (n: number) => setFilters(p => ({ ...p, bedrooms: p.bedrooms === n ? null : n })), []
  );
  const setPriceMin = useCallback(
    (v: number) => setFilters(p => ({ ...p, priceRange: [v, Math.max(v, p.priceRange[1])] })), []
  );
  const setPriceMax = useCallback(
    (v: number) => setFilters(p => ({ ...p, priceRange: [Math.min(p.priceRange[0], v), v] })), []
  );
  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const handleApply = useCallback(() => { onApplyFilters?.(filters); setShowFilter(false); }, [filters, onApplyFilters]);
  const openFilter  = () => { setFilters(activeFilters ?? DEFAULT_FILTERS); setShowFilter(true); };

  const ptop = Platform.OS === "android" ? insets.top + 10 : insets.top + 6;

  // Greeting fades out on scroll
  const greetingOpacity = scrollY.interpolate({ inputRange: [0, 35], outputRange: [1, 0], extrapolate: "clamp" });
  const greetingHeight  = scrollY.interpolate({ inputRange: [0, 35], outputRange: [18, 0], extrapolate: "clamp" });

  return (
    <>
      {showStatusBar && (
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      )}

      {/* ══ HEADER ═══════════════════════════════════════════════════════════ */}
      <ThemedView style={[styles.card, {
        paddingTop: ptop,
        borderBottomColor: theme.outline + "18",
      }]}>

        {/* Gradient wash */}
        <LinearGradient
          colors={isDark
            ? [theme.primary + "18", "transparent"]
            : [theme.surface + "0A", "transparent"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* ── Row 1: Brand + Actions ─────────────────────────────────────── */}
        <ThemedView style={styles.row1}>

          {leftElement ?? (
            <ThemedView style={styles.brand}>
              <Animated.View style={{ transform: [{ rotate: logoSpin }] }}>
                <LinearGradient
                  colors={[theme.primary, theme.secondary ?? theme.primary + "BB"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.brandBubble}
                >
                  <MaterialCommunityIcons name="home-roof" size={20} color="#fff" />
                  <ThemedView style={styles.shimmerDot} />
                </LinearGradient>
              </Animated.View>

              <ThemedView>
                <ThemedView style={styles.brandNameRow}>
                  <ThemedText style={[styles.brandName, { color: theme.text }]}>Easy</ThemedText>
                  <ThemedText style={[styles.brandName, { color: theme.primary }]}>Rent</ThemedText>
                </ThemedView>
                <Animated.View style={{ height: greetingHeight, opacity: greetingOpacity, overflow: "hidden" }}>
                  <ThemedText style={[styles.brandGreeting, { color: theme.text + "58" }]}>
                    {getGreeting()}
                  </ThemedText>
                </Animated.View>
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.actions}>
            {rightElement ?? (
              <>
                {/* View toggle */}
                <TouchableOpacity
                  onPress={() => setViewType(v => v === "grid" ? "list" : "grid")}
                  style={[styles.iconBtn, {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.outline + "28",
                  }]}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={viewType === "grid" ? "view-list" : "grid-view"}
                    size={18} color={theme.text + "BB"}
                  />
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity
                  onPress={() => setShowNotifications(true)}
                  style={[styles.iconBtn, {
                    backgroundColor: unreadCount > 0 ? theme.primary + "16" : theme.surfaceVariant,
                    borderColor: unreadCount > 0 ? theme.primary + "40" : theme.outline + "28",
                  }]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={unreadCount > 0 ? "notifications" : "notifications-outline"}
                    size={19}
                    color={unreadCount > 0 ? theme.primary : theme.text + "BB"}
                  />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <Animated.View style={{...styles.notifBadge, borderWidth:1, borderColor: theme.outline + "60" , transform: [{ scale: badgeScale }] }}>
                        <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                      </Animated.View>
                    )}
                  </AnimatePresence>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </ThemedView>

        {/* ── Stats cards ────────────────────────────────────────────────── */}
        <StatCards
          totalProperties={totalProperties}
          availableProperties={availableProperties}
          totalServices={totalServices}
          theme={theme}
        />

        {/* ── Row 3: TX selector + filter ────────────────────────────────── */}
        <ThemedView style={styles.row3}>

          {/* Segmented control */}
          <ThemedView style={[styles.txSegment, {
            backgroundColor: theme.surfaceVariant + "CC",
            borderColor: theme.outline + "25",
          }]}>
            {TX_CONFIG.map(({ key, label, icon }) => {
              const active = selectedTx === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleTxSelect(key)}
                  activeOpacity={0.8}
                  style={styles.txItem}
                >
                  {/* Active background */}
                  {active && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ type: "spring", stiffness: 340, damping: 22 }}
                      style={[styles.txActiveBg]}
                    >
                      <LinearGradient
                        colors={[theme.primary, theme.secondary ?? theme.primary + "BB"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </MotiView>
                  )}
                  <Ionicons
                    name={icon as any}
                    size={13}
                    color={active ? "#fff" : theme.text + "77"}
                    style={{ zIndex: 1 }}
                  />
                  <ThemedText style={[styles.txLabel, { color: active ? "#fff" : theme.text + "77", zIndex: 1 }]}>
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>

          {/* Filter button */}
          <TouchableOpacity onPress={openFilter} activeOpacity={0.8} style={styles.filterBtnWrap}>
            <LinearGradient
              colors={activeFilterCount > 0
                ? [theme.primary, theme.secondary ?? theme.primary + "BB"]
                : isDark
                  ? [theme.surfaceVariant + "EE", theme.surfaceVariant + "EE"]
                  : ["#F1F5F9", "#F1F5F9"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.filterBtn, {
                borderColor: activeFilterCount > 0 ? theme.primary + "55" : theme.outline + "28",
              }]}
            >
              <Ionicons name="options" size={15} color={activeFilterCount > 0 ? "#fff" : theme.text + "99"} />
              <ThemedText style={[styles.filterBtnText, { color: activeFilterCount > 0 ? "#fff" : theme.text + "99" }]}>
                Filtres
              </ThemedText>
              {activeFilterCount > 0 && (
                <ThemedView style={styles.filterBadge}>
                  <ThemedText style={styles.filterBadgeText}>{activeFilterCount}</ThemedText>
                </ThemedView>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/*  FILTER PANEL  */}
      <AnimatePresence>
            
        {showFilter && (
           <> 
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 180 }}
              style={styles.scrim}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowFilter(false)} />
            </MotiView>

            <ScrollView
            showsHorizontalScrollIndicator={false}
            >
            <ThemedView
              style={[styles.filterPanel, {
                backgroundColor: theme.surface,
                borderColor: theme.outline + "22",
                top: ptop + 100,
              }]}
            >
              <LinearGradient
                colors={[theme.primary + "0C", "transparent"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                pointerEvents="none"
              />

              {/* Drag handle */}
              <ThemedView style={styles.dragHandleWrap}>
                <ThemedView style={[styles.dragHandle, { backgroundColor: theme.outline + "45" }]} />
              </ThemedView>

              {/* Panel header */}
              <ThemedView style={[styles.panelHeader, { borderBottomColor: theme.outline + "15" }]}>
                <ThemedView style={styles.panelTitleRow}>
                  <LinearGradient
                    colors={[theme.primary + "22", theme.primary + "0E"]}
                    style={styles.panelTitleIcon}
                  >
                    <Ionicons name="options" size={14} color={theme.primary} />
                  </LinearGradient>
                  <ThemedText style={[styles.panelTitle, { color: theme.text }]}>Filtres </ThemedText>
                  {activeFilterCount > 0 && (
                    <ThemedView style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                      <ThemedText style={styles.activeBadgeText}>{activeFilterCount} actif</ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
                <TouchableOpacity onPress={handleReset} style={[styles.resetBtn, { backgroundColor: theme.primary + "10" }]}>
                  <Ionicons name="refresh" size={12} color={theme.primary} />
                  <ThemedText style={[styles.resetText, { color: theme.primary }]}>Réinitialiser</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.panelBody}>

                {/* Type de propriété */}
                <PanelSection label="TYPE DE PROPRIÉTÉ" theme={theme}>
                  <ThemedView style={styles.chipWrap}>
                    {PROPERTY_TYPES.map(pt => {
                      const on = filters.propertyType === pt.key;
                      return (
                        <TouchableOpacity key={pt.key} onPress={() => setPropertyType(pt.key)} activeOpacity={0.75}>
                          <AnimatePresence>
                            {on
                              ? <MotiView
                                  key="on"
                                  from={{ scale: 0.88 }} animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 360, damping: 20 }}
                                  style={[styles.chip, { backgroundColor: theme.primary, borderColor: theme.primary + "80" }]}
                                >
                                  <FontAwesome5 name={pt.icon as any} size={11} color="#fff" />
                                  <ThemedText style={[styles.chipText, { color: "#fff" }]}>{pt.label}</ThemedText>
                                </MotiView>
                              : <ThemedView style={[styles.chip, { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + "28" }]}>
                                  <FontAwesome5 name={pt.icon as any} size={11} color={theme.text + "88"} />
                                  <ThemedText style={[styles.chipText, { color: theme.text + "CC" }]}>{pt.label}</ThemedText>
                                </ThemedView>
                            }
                          </AnimatePresence>
                        </TouchableOpacity>
                      );
                    })}
                  </ThemedView>
                </PanelSection>

                <Divider theme={theme} />

                {/* Chambres */}
                <PanelSection label="CHAMBRES" theme={theme}>
                  <ThemedView style={styles.bedroomRow}>
                    {BEDROOM_OPTIONS.map(n => {
                      const on = filters.bedrooms === n;
                      return (
                        <TouchableOpacity
                          key={n}
                          onPress={() => setBedrooms(n)}
                          activeOpacity={0.75}
                          style={[styles.bedroomBtn,
                            on
                              ? { borderColor: theme.primary }
                              : { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + "28" }
                          ]}
                        >
                          {on && (
                            <LinearGradient
                              colors={[theme.primary, theme.secondary ?? theme.primary + "BB"]}
                              style={StyleSheet.absoluteFill}
                            />
                          )}
                          <ThemedText style={[styles.bedroomText, { color: on ? "#fff" : theme.text, zIndex: 1 }]}>
                            {n === 5 ? "5+" : n}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ThemedView>
                </PanelSection>

                <Divider theme={theme} />

                {/* Disponibilité */}
                <PanelSection label="DISPONIBILITÉ" theme={theme}>
                  <ThemedView style={styles.chipWrap}>
                    {(["rent", "sell"] as const).map(t => {
                      const on = filters.actionType === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setFilters(p => ({ ...p, actionType: p.actionType === t ? null : t }))}
                          activeOpacity={0.75}
                          style={[styles.chip,
                            on
                              ? { backgroundColor: theme.primary, borderColor: theme.primary + "80" }
                              : { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + "28" }
                          ]}
                        >
                          <Ionicons name={t === "rent" ? "key-outline" : "pricetag-outline"} size={13} color={on ? "#fff" : theme.text + "88"} />
                          <ThemedText style={[styles.chipText, { color: on ? "#fff" : theme.text + "CC" }]}>
                            {t === "rent" ? "À louer" : "À vendre"}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ThemedView>
                </PanelSection>

                <Divider theme={theme} />

                {/* Budget */}
                <PanelSection label="BUDGET" theme={theme}>
                  <ThemedView style={[styles.rangeDisplay, { backgroundColor: theme.primary + "0E", borderColor: theme.primary + "22" }]}>
                    <ThemedView style={styles.rangeItem}>
                      <ThemedText style={[styles.rangeHint, { color: theme.text + "55" }]}>MINIMUM</ThemedText>
                      <ThemedText style={[styles.rangeVal, { color: theme.primary }]}>{formatPrice(filters.priceRange[0])} F</ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.rangeSep, { backgroundColor: theme.primary + "28" }]} />
                    <ThemedView style={styles.rangeItem}>
                      <ThemedText style={[styles.rangeHint, { color: theme.text + "55" }]}>MAXIMUM</ThemedText>
                      <ThemedText style={[styles.rangeVal, { color: theme.primary }]}>{formatPrice(filters.priceRange[1])} F</ThemedText>
                    </ThemedView>
                  </ThemedView>

                  <Text style={[styles.stepLabel, { color: theme.text + "50" }]}>Prix minimum</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepScroll}>
                    {PRICE_STEPS.slice(0, -1).map(s => {
                      const on = filters.priceRange[0] === s;
                      return (
                        <TouchableOpacity
                          key={`mn${s}`}
                          onPress={() => setPriceMin(s)}
                          activeOpacity={0.75}
                          style={[styles.priceStep,
                            on
                              ? { backgroundColor: theme.primary, borderColor: theme.primary }
                              : { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + "28" }
                          ]}
                        >
                          <ThemedText style={[styles.priceStepText, { color: on ? "#fff" : theme.text + "CC" }]}>{formatPrice(s)}</ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <Text style={[styles.stepLabel, { color: theme.text + "50", marginTop: 10 }]}>Prix maximum</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepScroll}>
                    {PRICE_STEPS.slice(1).map(s => {
                      const on = filters.priceRange[1] === s;
                      return (
                        <TouchableOpacity
                          key={`mx${s}`}
                          onPress={() => setPriceMax(s)}
                          activeOpacity={0.75}
                          style={[styles.priceStep,
                            on
                              ? { backgroundColor: theme.primary, borderColor: theme.primary }
                              : { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + "28" }
                          ]}
                        >
                          <ThemedText style={[styles.priceStepText, { color: on ? "#fff" : theme.text + "CC" }]}>{formatPrice(s)}</ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </PanelSection>
              </ScrollView>

              {/* Footer */}
              <ThemedView style={[styles.panelFooter, { borderTopColor: theme.outline + "15" }]}>
                <TouchableOpacity
                  onPress={() => setShowFilter(false)}
                  style={[styles.cancelBtn, { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + "28" }]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.cancelText, { color: theme.text + "88" }]}>Annuler</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleApply} activeOpacity={0.85} style={{ flex: 1.8 }}>
                  <LinearGradient
                    colors={[theme.primary, theme.secondary ?? theme.primary + "BB"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.applyBtn}
                  >
                    <Ionicons name="checkmark-circle" size={17} color="#fff" />
                    <Text style={styles.applyText}>Appliquer les filtres</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            </ScrollView>
            </>
        )}
         
      </AnimatePresence>

      <NotificationSystem
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />
    </>
  );
});

// ─── Helper sub-components ────────────────────────────────────────────────────
const PanelSection: React.FC<{ label: string; theme: any; children: React.ReactNode }> = ({ label, theme, children }) => (
  <ThemedView style={styles.section}>
    <ThemedText style={[styles.sectionLabel, { color: theme.text + "50" }]}>{label}</ThemedText>
    {children}
  </ThemedView>
);

const Divider: React.FC<{ theme: any }> = ({ theme }) => (
  <ThemedView style={[styles.divider, { backgroundColor: theme.outline + "15" }]} />
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Header card ───────────────────────────────────────────────────────────
  card: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    overflow: "hidden",
  },

  // ── Row 1 ─────────────────────────────────────────────────────────────────
  row1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  brandBubble: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 7,
  },
  shimmerDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  brandNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  brandGreeting: {
    fontSize: 11.5,
    fontWeight: "500",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  notifBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF385C",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },

  // ── Stats chips ───────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 8,
  },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statNum: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statChipLabel: {
    fontWeight: "800",
  },

  // ── Row 3: TX + filter ────────────────────────────────────────────────────
  row3: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  txSegment: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  txItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    gap: 5,
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },
  txActiveBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 11,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  txLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  filterBtnWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.28)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },

  // ── Filter panel ──────────────────────────────────────────────────────────
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
    zIndex: 998,
  },
  filterPanel: {
    position: "absolute",
    left: 10,
    right: 10,
    zIndex: 999,
    borderRadius: 22,
    borderWidth: 1,
    maxHeight: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 22,
    overflow: "hidden",
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 2,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  panelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  panelTitleIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  activeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "600",
  },
  panelBody: {
    paddingBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  bedroomRow: {
    flexDirection: "row",
    gap: 8,
  },
  bedroomBtn: {
    width: 48,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  bedroomText: {
    fontSize: 14,
    fontWeight: "700",
  },
  rangeDisplay: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 13,
    overflow: "hidden",
  },
  rangeItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  rangeSep: {
    width: 1,
    marginVertical: 10,
  },
  rangeHint: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  rangeVal: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  stepScroll: {
    gap: 7,
    paddingRight: 6,
  },
  priceStep: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  priceStepText: {
    fontSize: 12,
    fontWeight: "700",
  },
  panelFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  applyBtn: {
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  applyText: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});

RenderHeader.displayName = "RenderHeader";
export default RenderHeader;
