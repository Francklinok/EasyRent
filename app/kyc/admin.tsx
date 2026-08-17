/**
 * Admin KYC Review Screen
 * Lists pending KYC submissions and allows approve / reject / request-more-info
 * Access restricted to users with role === 'admin' | 'super_admin'
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, TextInput, RefreshControl, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getKYCService, KYCStatus } from '@/services/api/kycService';

type ReviewAction = 'approved' | 'rejected' | 'request_more_info';

export default function AdminKYCScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const kycService = getKYCService();

  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const load = useCallback(async (p = 1) => {
    try {
      const [reviewsData, statsData] = await Promise.all([
        kycService.getPendingReviews(p, 20),
        kycService.getKYCStatistics().catch(() => null),
      ]);
      setEntries(reviewsData.data || []);
      setTotalPages(reviewsData.totalPages || 1);
      setStats(statsData);
    } catch (err) {
      console.error('Admin KYC load error:', err);
      Alert.alert(t('kycAdmin.errLoad'), t('kycAdmin.errLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    load(page);
  }, [load, page, isAdmin]);

  const handleReview = async () => {
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      const result = await kycService.adminReviewKYC(reviewTarget.userId, {
        action: reviewAction,
        notes: reviewNotes || undefined,
        rejectionReasons: rejectionReasons
          ? rejectionReasons.split('\n').map(s => s.trim()).filter(Boolean)
          : undefined,
      });

      if (result.success) {
        Alert.alert(
          reviewAction === 'approved' ? t('kycAdmin.kycApproved') : reviewAction === 'rejected' ? t('kycAdmin.kycRejected') : t('kycAdmin.infoRequested'),
          result.message
        );
        setReviewTarget(null);
        setReviewNotes('');
        setRejectionReasons('');
        load(page);
      } else {
        Alert.alert('Erreur', result.errors?.join('\n') || result.message);
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('kycAdmin.reviewFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_COLOR: Record<string, string> = {
    verified: '#22c55e',
    pending: '#f59e0b',
    under_review: '#3b82f6',
    rejected: '#ef4444',
    expired: '#6b7280',
    suspended: '#dc2626',
    unverified: '#9ca3af',
  };

  const renderStats = () => {
    if (!stats) return null;
    return (
      <ThemedView style={[s.statsRow]}>
        {[
          { label: t('kycAdmin.statTotal'), value: stats.total, color: theme.text },
          { label: t('kycAdmin.statPending'), value: stats.pendingCount, color: '#f59e0b' },
          { label: t('kycAdmin.statExpiringSoon'), value: stats.expiringSoon, color: '#ef4444' },
          { label: t('kycAdmin.statVerified'), value: stats.byStatus?.verified || 0, color: '#22c55e' },
        ].map(stat => (
          <ThemedView key={stat.label} style={[s.statCard, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
            <ThemedText style={{ fontSize: 22, fontWeight: '900', color: stat.color }}>
              {stat.value ?? '—'}
            </ThemedText>
            <ThemedText type="body" style={{ fontSize: 11, color: theme.onSurface + '70', textAlign: 'center' }}>
              {stat.label}
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    );
  };

  const renderEntry = (entry: any) => {
    const pi = entry.personalInfo;
    const statusColor = STATUS_COLOR[entry.status] || '#9ca3af';
    const progress = entry.progress?.overallProgress || 0;

    return (
      <ThemedView key={entry.id} style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
        {/* Header row */}
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <ThemedView style={[s.avatar, { backgroundColor: statusColor + '20' }]}>
            <ThemedText style={{ fontSize: 18, fontWeight: '900', color: statusColor }}>
              {pi ? (pi.firstName?.[0] || '?') : '?'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: '800', fontSize: 15, color: theme.text }}>
              {pi ? `${pi.firstName} ${pi.lastName}` : `User ${entry.userId?.slice(-6)}`}
            </ThemedText>
            <ThemedText type="body" style={{ fontSize: 12, color: theme.onSurface + '60' }}>
              {pi?.occupation || t('kycAdmin.occupationFallback')}
              {pi?.employer ? ` • ${pi.employer}` : ''}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[s.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>
              {entry.status?.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Progress bar */}
        <ThemedView style={{ marginBottom: 10 }}>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <ThemedText type="body" style={{ fontSize: 11, color: theme.onSurface + '60' }}>
              {t('kycAdmin.progressLabel')}
            </ThemedText>
            <ThemedText type="body" style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>
              {progress}%
            </ThemedText>
          </ThemedView>
          <ThemedView style={[s.progressTrack, { backgroundColor: theme.outline + '25' }]}>
            <ThemedView style={[s.progressFill, { width: `${progress}%` as any, backgroundColor: statusColor }]} />
          </ThemedView>
        </ThemedView>

        {/* Info grid */}
        <ThemedView style={s.infoGrid}>
          {[
            { icon: 'earth', label: pi?.nationality || '—' },
            { icon: 'phone', label: pi?.phoneNumber || '—' },
            { icon: 'card-account-details-outline', label: `${entry.documents?.length || 0} doc(s)` },
            { icon: 'map-marker-outline', label: entry.addresses?.length ? entry.addresses[0].city : '—' },
          ].map((info, i) => (
            <ThemedView key={i} style={s.infoItem}>
              <MaterialCommunityIcons name={info.icon as any} size={13} color={theme.onSurface + '60'} />
              <ThemedText type="body" style={{ fontSize: 12, color: theme.onSurface + '70' }}>{info.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Submitted at */}
        {entry.submittedAt && (
          <ThemedText type="body" style={{ fontSize: 11, color: theme.onSurface + '50', marginTop: 6 }}>
            {t('kycAdmin.submittedAt')} {new Date(entry.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </ThemedText>
        )}

        {/* Action buttons */}
        <ThemedView style={s.actionsRow}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#22c55e15', borderColor: '#22c55e' }]}
            onPress={() => { setReviewTarget(entry); setReviewAction('approved'); setReviewNotes(''); setRejectionReasons(''); }}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#22c55e" />
            <ThemedText style={{ color: '#22c55e', fontWeight: '700', fontSize: 12 }}>{t('kycAdmin.approveBtn')}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#3b82f615', borderColor: '#3b82f6' }]}
            onPress={() => { setReviewTarget(entry); setReviewAction('request_more_info'); setReviewNotes(''); setRejectionReasons(''); }}
          >
            <Ionicons name="information-circle-outline" size={16} color="#3b82f6" />
            <ThemedText style={{ color: '#3b82f6', fontWeight: '700', fontSize: 12 }}>{t('kycAdmin.infoBtn')}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}
            onPress={() => { setReviewTarget(entry); setReviewAction('rejected'); setReviewNotes(''); setRejectionReasons(''); }}
          >
            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            <ThemedText style={{ color: '#ef4444', fontWeight: '700', fontSize: 12 }}>{t('kycAdmin.rejectBtn')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  };

  const renderReviewModal = () => {
    if (!reviewTarget) return null;
    const pi = reviewTarget.personalInfo;
    const actionColors = {
      approved: '#22c55e',
      rejected: '#ef4444',
      request_more_info: '#3b82f6',
    };
    const actionLabels = {
      approved: t('kycAdmin.actionApprove'),
      rejected: t('kycAdmin.actionReject'),
      request_more_info: t('kycAdmin.actionMoreInfo'),
    };

    return (
      <Modal visible animationType="slide" transparent onRequestClose={() => setReviewTarget(null)}>
        <ThemedView style={[s.modalOverlay]}>
          <ThemedView style={[s.modalContent, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ThemedView style={[s.avatar, { backgroundColor: actionColors[reviewAction] + '20' }]}>
                <MaterialCommunityIcons
                  name={reviewAction === 'approved' ? 'shield-check' : reviewAction === 'rejected' ? 'shield-off' : 'shield-alert'}
                  size={22}
                  color={actionColors[reviewAction]}
                />
              </ThemedView>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '900', fontSize: 15, color: theme.text }}>
                  {actionLabels[reviewAction]}
                </ThemedText>
                <ThemedText type="body" style={{ fontSize: 12, color: theme.onSurface + '60' }}>
                  {pi ? `${pi.firstName} ${pi.lastName}` : `User ${reviewTarget.userId?.slice(-6)}`}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Action selector */}
            <ThemedText type="body" style={{ fontSize: 13, color: theme.onSurface + '70', marginBottom: 8 }}>
              {t('kycAdmin.modalDecision')}
            </ThemedText>
            <ThemedView style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['approved', 'rejected', 'request_more_info'] as const).map(a => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setReviewAction(a)}
                  style={[s.actionChip, {
                    backgroundColor: reviewAction === a ? actionColors[a] + '20' : theme.surface,
                    borderColor: reviewAction === a ? actionColors[a] : theme.outline + '30',
                  }]}
                >
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: reviewAction === a ? actionColors[a] : theme.onSurface + '60' }}>
                    {a === 'approved' ? t('kycAdmin.chipApprove') : a === 'rejected' ? t('kycAdmin.chipReject') : t('kycAdmin.chipMoreInfo')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>

            {/* Notes */}
            <ThemedText type="body" style={{ fontSize: 13, color: theme.onSurface + '70', marginBottom: 6 }}>
              {t('kycAdmin.notesLabel')}
            </ThemedText>
            <TextInput
              value={reviewNotes}
              onChangeText={setReviewNotes}
              placeholder={t('kycAdmin.notesPlaceholder')}
              placeholderTextColor={theme.onSurface + '40'}
              multiline
              numberOfLines={2}
              style={[s.textArea, { backgroundColor: theme.surface, borderColor: theme.outline + '40', color: theme.text }]}
            />

            {/* Rejection reasons */}
            {reviewAction === 'rejected' && (
              <>
                <ThemedText type="body" style={{ fontSize: 13, color: theme.onSurface + '70', marginBottom: 6, marginTop: 12 }}>
                  {t('kycAdmin.rejectionReasonsLabel')}
                </ThemedText>
                <TextInput
                  value={rejectionReasons}
                  onChangeText={setRejectionReasons}
                  placeholder={t('kycAdmin.rejectionPlaceholder')}
                  placeholderTextColor={theme.onSurface + '40'}
                  multiline
                  numberOfLines={3}
                  style={[s.textArea, { backgroundColor: theme.surface, borderColor: '#ef444440', color: theme.text }]}
                />
              </>
            )}

            {/* Buttons */}
            <ThemedView style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.modalBtn, { flex: 1, borderWidth: 1, borderColor: theme.outline + '50' }]}
                onPress={() => setReviewTarget(null)}
                disabled={submitting}
              >
                <ThemedText style={{ fontWeight: '700', color: theme.text }}>{t('kycAdmin.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { flex: 2, backgroundColor: actionColors[reviewAction] }]}
                onPress={handleReview}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <ThemedText style={{ fontWeight: '800', color: '#fff' }}>{actionLabels[reviewAction]}</ThemedText>
                }
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <MaterialCommunityIcons name="shield-lock-outline" size={64} color={theme.outline} />
        <ThemedText type="normaltitle" style={{ marginTop: 16, textAlign: 'center', color: theme.text, fontWeight: '900' }}>
          {t('kycAdmin.accessRestricted')}
        </ThemedText>
        <ThemedText type="body" style={{ marginTop: 8, textAlign: 'center', color: theme.onSurface + '60' }}>
          {t('kycAdmin.accessMsg')}
        </ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={[s.cta, { backgroundColor: theme.primary, marginTop: 24 }]}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>{t('kycAdmin.back')}</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      {renderReviewModal()}

      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>
            {t('kycAdmin.headerTitle')}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
            {t('kycAdmin.headerSubtitle')}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[s.adminBadge, { backgroundColor: theme.primary + '15' }]}>
          <MaterialCommunityIcons name="shield-crown-outline" size={14} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>ADMIN</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(page); }}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 48 }} />
        ) : (
          <>
            {renderStats()}

            {entries.length === 0 ? (
              <ThemedView style={[s.emptyCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
                <MaterialCommunityIcons name="shield-check-outline" size={56} color={theme.outline} />
                <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', marginTop: 12 }}>
                  {t('kycAdmin.emptyTitle')}
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', textAlign: 'center', fontSize: 13, marginTop: 6 }}>
                  {t('kycAdmin.emptyDesc')}
                </ThemedText>
              </ThemedView>
            ) : (
              <>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>
                  {t('kycAdmin.requestsCount', { count: entries.length })} — {t('kycAdmin.page')} {page}/{totalPages}
                </ThemedText>
                {entries.map(renderEntry)}

                {/* Pagination */}
                {totalPages > 1 && (
                  <ThemedView style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                    <TouchableOpacity
                      disabled={page <= 1}
                      onPress={() => setPage(p => p - 1)}
                      style={[s.pageBtn, { borderColor: theme.outline + '40', opacity: page <= 1 ? 0.4 : 1 }]}
                    >
                      <Ionicons name="chevron-back" size={16} color={theme.text} />
                    </TouchableOpacity>
                    <ThemedView style={[s.pageBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}>
                      <ThemedText style={{ fontWeight: '700', color: theme.primary }}>{page}</ThemedText>
                    </ThemedView>
                    <TouchableOpacity
                      disabled={page >= totalPages}
                      onPress={() => setPage(p => p + 1)}
                      style={[s.pageBtn, { borderColor: theme.outline + '40', opacity: page >= totalPages ? 0.4 : 1 }]}
                    >
                      <Ionicons name="chevron-forward" size={16} color={theme.text} />
                    </TouchableOpacity>
                  </ThemedView>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: 'center', gap: 2 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(128,128,128,0.07)' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: 40, alignItems: 'center' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 25, paddingHorizontal: 24 },
  pageBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, paddingBottom: 36 },
  actionChip: { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  textArea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, minHeight: 70, textAlignVertical: 'top' },
  modalBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
