/**
 * LeaseManagementScreen
 * Vue globale de tous les baux : actifs, expirés, en cours de renouvellement.
 * Filtres par statut, alertes d'expiration imminente.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView, RefreshControl, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { getBookingService } from '@/services/api/bookingService';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { getUnifiedCacheService } from '@/services/offline/core/UnifiedCacheService';

interface LeaseEntry {
  activityId:    string;
  propertyTitle: string;
  tenantName:    string;
  tenantId:      string;
  startDate?:    string;
  endDate?:      string;
  monthlyRent:   number;
  currency:      string;
  isContratEnd:  boolean;
  contractUrl:   string | null;
  daysUntilEnd?: number;
  status:        'active' | 'expiring_soon' | 'expired' | 'no_end_date';
}

const getDaysUntil = (date?: string): number | undefined => {
  if (!date) return undefined;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const leaseStatus = (entry: Omit<LeaseEntry, 'status'>): LeaseEntry['status'] => {
  if (entry.isContratEnd) return 'expired';
  if (!entry.endDate) return 'no_end_date';
  const days = getDaysUntil(entry.endDate);
  if (days === undefined) return 'no_end_date';
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring_soon';
  return 'active';
};

const STATUS_CONFIG = {
  active:          { label: 'Actif',              color: '#10B981', icon: 'check-circle' },
  expiring_soon:   { label: 'Expire bientôt',     color: '#F59E0B', icon: 'alert-circle' },
  expired:         { label: 'Expiré / Terminé',   color: '#6B7280', icon: 'close-circle' },
  no_end_date:     { label: 'Sans date de fin',   color: '#3B82F6', icon: 'infinity' },
};

export default function LeaseManagementScreen() {
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const { t }      = useLanguage();
  const [leases,     setLeases]     = useState<LeaseEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState<LeaseEntry['status'] | 'all'>('all');
  const bookingService = getBookingService();

  const load = useCallback(async (showRefresh = false) => {
    if (!user?.id) return;
    const cache = getUnifiedCacheService();
    const cacheKey = `leases:${user.id}`;
    if (!showRefresh) {
      const cached = await cache.get<LeaseEntry[]>(cacheKey);
      if (cached) { setLeases(cached); setLoading(false); }
    }
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await bookingService.getOwnerRequests(user.id);
      const accepted = (data ?? []).filter((a: any) => a.isReservationAccepted || a.reservationStatus === 'ACCEPTED');

      const mapped: LeaseEntry[] = accepted.map((a: any) => {
        const base = {
          activityId:    a.id,
          propertyTitle: a.propertyTitle ?? 'Propriété',
          tenantName:    a.clientName    ?? 'Locataire',
          tenantId:      a.clientId,
          startDate:     a.bookingInfo?.startDate,
          endDate:       a.bookingInfo?.endDate ?? a.contratEndDate,
          monthlyRent:   a.monthlyRent   ?? a.amount ?? 0,
          currency:      a.currency      ?? 'XAF',
          isContratEnd:  a.isContratEnd  ?? false,
          contractUrl:   a.contractUrl   ?? null,
          daysUntilEnd:  getDaysUntil(a.bookingInfo?.endDate ?? a.contratEndDate),
        };
        return { ...base, status: leaseStatus(base) };
      });

      setLeases(mapped);
      cache.set(cacheKey, mapped, { ttl: 2 * 60 * 1000 }).catch(() => {});
    } catch (err) {
      console.error('[LeaseManagement] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    filter === 'all' ? leases : leases.filter(l => l.status === filter),
    [leases, filter],
  );

  const expiringCount = leases.filter(l => l.status === 'expiring_soon').length;

  if (loading) return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} />}
      >
        <ThemedView style={{ padding: 16, gap: 16 }}>

          {/* Alerte expirations imminentes */}
          {expiringCount > 0 && (
            <ThemedView style={[styles.alertBanner, { borderColor: '#F59E0B' + '40', backgroundColor: '#F59E0B' + '10' }]}>
              <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />
              <ThemedText style={{ color: '#F59E0B', fontWeight: '600', flex: 1 }}>
                {expiringCount} bail{expiringCount > 1 ? 'x' : ''} expire{expiringCount > 1 ? 'nt' : ''} dans moins de 30 jours.
              </ThemedText>
            </ThemedView>
          )}

          {/* Résumé */}
          <View style={styles.statsRow}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = leases.filter(l => l.status === key).length;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setFilter(key as any)}
                  style={[styles.miniStat, { borderColor: cfg.color + '30', backgroundColor: filter === key ? cfg.color + '18' : 'transparent' }]}
                >
                  <ThemedText style={[styles.miniStatCount, { color: cfg.color }]}>{count}</ThemedText>
                  <ThemedText style={styles.miniStatLabel}>{cfg.label}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Filtre ALL */}
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.allFilter, { backgroundColor: filter === 'all' ? theme.primary : theme.surfaceVariant }]}
          >
            <ThemedText style={{ color: filter === 'all' ? '#fff' : theme.onSurface + '80', fontWeight: '600', fontSize: 13 }}>
              Tous ({leases.length})
            </ThemedText>
          </TouchableOpacity>

          {/* Liste */}
          {filtered.length === 0 ? (
            <ThemedView style={{ alignItems: 'center', paddingVertical: 50 }}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color={theme.onSurface + '30'} />
              <ThemedText style={{ marginTop: 12, opacity: 0.5 }}>{t('leaseManagement.noLeaseForFilter')}</ThemedText>
            </ThemedView>
          ) : (
            <View style={{ gap: 12 }}>
              {filtered.map(lease => {
                const cfg = STATUS_CONFIG[lease.status];
                return (
                  <TouchableOpacity
                    key={lease.activityId}
                    onPress={() => router.push({ pathname: '/owner/TenantManagementScreen', params: { activityId: lease.activityId } } as any)}
                    style={[styles.leaseCard, { borderColor: cfg.color + '30', borderLeftColor: cfg.color, borderLeftWidth: 4 }]}
                  >
                    <View style={styles.leaseHeader}>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.leaseProperty}>{lease.propertyTitle}</ThemedText>
                        <ThemedText style={styles.leaseTenant}>{lease.tenantName}</ThemedText>
                      </View>
                      <View style={[styles.leaseBadge, { backgroundColor: cfg.color + '18' }]}>
                        <MaterialCommunityIcons name={cfg.icon as any} size={14} color={cfg.color} />
                        <ThemedText style={[styles.leaseBadgeText, { color: cfg.color }]}>{cfg.label}</ThemedText>
                      </View>
                    </View>

                    <View style={styles.leaseDetails}>
                      <LDetail icon="cash" label={`${lease.monthlyRent.toLocaleString()} ${lease.currency}/mois`} theme={theme} />
                      {lease.startDate && (
                        <LDetail icon="calendar-start" label={`Début: ${new Date(lease.startDate).toLocaleDateString('fr-FR')}`} theme={theme} />
                      )}
                      {lease.endDate && (
                        <LDetail
                          icon="calendar-end"
                          label={`Fin: ${new Date(lease.endDate).toLocaleDateString('fr-FR')}${lease.daysUntilEnd !== undefined && lease.daysUntilEnd > 0 ? ` (dans ${lease.daysUntilEnd}j)` : ''}`}
                          theme={theme}
                          color={lease.status === 'expiring_soon' ? '#F59E0B' : undefined}
                        />
                      )}
                    </View>

                    <View style={styles.leaseActions}>
                      {lease.contractUrl && (
                        <ChipBtn icon="download" label="Contrat" color="#6366F1" onPress={() => {}} />
                      )}
                      <ChipBtn icon="account" label="Voir fiche" color={theme.primary} onPress={() =>
                        router.push({ pathname: '/owner/TenantManagementScreen', params: { activityId: lease.activityId } } as any)
                      } />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const LDetail = ({ icon, label, theme, color }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <MaterialCommunityIcons name={icon} size={13} color={color ?? theme.onSurface + '60'} />
    <ThemedText style={{ fontSize: 12, opacity: color ? 1 : 0.65, color: color ?? undefined }}>{label}</ThemedText>
  </View>
);

const ChipBtn = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: 10, backgroundColor: color + '15', borderWidth: 1, borderColor: color + '30' }}
  >
    <MaterialCommunityIcons name={icon} size={13} color={color} />
    <ThemedText style={{ fontSize: 12, fontWeight: '600', color }}>{label}</ThemedText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  statsRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  miniStat:    { flex: 1, minWidth: '45%', padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  miniStatCount:{ fontSize: 22, fontWeight: '800' },
  miniStatLabel:{ fontSize: 11, opacity: 0.7, textAlign: 'center' },
  allFilter:   { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'flex-start' },

  leaseCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  leaseHeader:{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  leaseProperty:{ fontSize: 15, fontWeight: '700' },
  leaseTenant:  { fontSize: 13, opacity: 0.6 },
  leaseBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  leaseBadgeText:{ fontSize: 11, fontWeight: '700' },
  leaseDetails:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  leaseActions:{ flexDirection: 'row', gap: 8 },
});
