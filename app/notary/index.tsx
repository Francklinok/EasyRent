import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { getAdminService, AdminDossier } from '@/services/api/adminService';

const STATUS_COLOR: Record<string, string> = {
  draft: '#9ca3af', submitted: '#3b82f6', under_review: '#f59e0b',
  validated: '#22c55e', rejected: '#ef4444', archived: '#6b7280',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon', submitted: 'Soumis', under_review: 'En révision',
  validated: 'Validé', rejected: 'Rejeté', archived: 'Archivé',
};
const STATUS_FILTERS = [undefined, 'submitted', 'under_review', 'validated', 'rejected'];

function personLabel(p?: string | { firstName: string; lastName: string; email: string }): string {
  if (!p) return '—';
  if (typeof p === 'string') return p.slice(-8);
  return `${p.firstName} ${p.lastName}`;
}

function propertyLabel(p?: string | { title?: string; address?: string }): string {
  if (!p) return '—';
  if (typeof p === 'string') return p.slice(-8);
  return p.title || p.address || '—';
}

export default function NotaryDossiersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isNotary = (user as any)?.role === 'notary' || (user as any)?.role === 'admin' || (user as any)?.role === 'super_admin';

  const [dossiers, setDossiers] = useState<AdminDossier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const [detailTarget, setDetailTarget] = useState<AdminDossier | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminDossier | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  const load = useCallback(async (p = 1) => {
    if (!user?.id) return;
    try {
      const res = await getAdminService().getDossiersByNotary(user.id, { page: p, limit: 20, status: statusFilter });
      setDossiers(res.dossiers);
      setTotal(res.total);
    } catch (e) {
      console.error('NotaryDossiers error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, user?.id]);

  useEffect(() => { if (isNotary) load(page); }, [load, page, isNotary]);

  const openDetail = async (d: AdminDossier) => {
    try {
      const full = await getAdminService().getDossierById(d.id);
      setDetailTarget(full);
      setCommentText('');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de charger le dossier.');
    }
  };

  const handleValidate = async (d: AdminDossier) => {
    Alert.alert('Valider', `Valider le dossier "${d.title || d.id.slice(-6)}" ? Cette action confirme la conformité légale de l'acte de vente.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Valider', onPress: async () => {
          try {
            await getAdminService().validateDossier(d.id);
            Alert.alert('Validé', 'Le dossier a été validé.');
            setDetailTarget(null);
            load(page);
          } catch (e: any) { Alert.alert('Erreur', e?.message); }
        }
      },
    ]);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { Alert.alert('Requis', 'Veuillez indiquer une raison de rejet.'); return; }
    setSubmitting(true);
    try {
      await getAdminService().rejectDossier(rejectTarget.id, rejectReason);
      Alert.alert('Rejeté', 'Le dossier a été rejeté.');
      setRejectTarget(null);
      setRejectReason('');
      setDetailTarget(null);
      load(page);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message);
    } finally { setSubmitting(false); }
  };

  const handleAddComment = async () => {
    if (!detailTarget || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await getAdminService().addDossierComment(detailTarget.id, commentText.trim());
      const refreshed = await getAdminService().getDossierById(detailTarget.id);
      setDetailTarget(refreshed);
      setCommentText('');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message);
    } finally { setSubmitting(false); }
  };

  const handleReviewDocument = async (docId: string, status: 'approved' | 'rejected') => {
    if (!detailTarget) return;
    try {
      await getAdminService().reviewDossierDocument(detailTarget.id, docId, status);
      const refreshed = await getAdminService().getDossierById(detailTarget.id);
      setDetailTarget(refreshed);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message);
    }
  };

  const renderDossier = (d: AdminDossier) => {
    const color = STATUS_COLOR[d.status] ?? '#9ca3af';
    const canAct = ['submitted', 'under_review'].includes(d.status);
    return (
      <TouchableOpacity key={d.id} onPress={() => openDetail(d)} activeOpacity={0.85}>
        <ThemedView style={[s.card, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ThemedView style={[s.iconBox, { backgroundColor: color + '15' }]}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={22} color={color} />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: '800', fontSize: 14, color: theme.text }} numberOfLines={1}>
                {d.title || `Dossier #${d.id.slice(-8).toUpperCase()}`}
              </ThemedText>
              <ThemedText type="body" style={{ fontSize: 12, color: theme.onSurface + '60', marginTop: 2 }}>
                {propertyLabel(d.propertyId)} • {personLabel(d.clientId)}
              </ThemedText>
              <ThemedText type="body" style={{ fontSize: 11, color: theme.onSurface + '50' }}>
                {new Date(d.createdAt).toLocaleDateString('fr-FR')}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[s.badge, { backgroundColor: color + '15' }]}>
              <ThemedText style={{ fontSize: 10, fontWeight: '700', color }}>{STATUS_LABEL[d.status] ?? d.status}</ThemedText>
            </ThemedView>
          </ThemedView>

          {canAct && (
            <ThemedView style={s.actionsRow}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#22c55e15', borderColor: '#22c55e' }]} onPress={() => handleValidate(d)}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#22c55e" />
                <ThemedText style={{ color: '#22c55e', fontWeight: '700', fontSize: 12 }}>Valider</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]} onPress={() => { setRejectTarget(d); setRejectReason(''); }}>
                <Ionicons name="close-circle-outline" size={14} color="#ef4444" />
                <ThemedText style={{ color: '#ef4444', fontWeight: '700', fontSize: 12 }}>Rejeter</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (!isNotary) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <MaterialCommunityIcons name="shield-lock-outline" size={64} color={theme.outline} />
        <ThemedText type="normaltitle" style={{ marginTop: 16, textAlign: 'center', fontWeight: '900' }}>Accès réservé aux notaires</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={[s.cta, { backgroundColor: theme.primary, marginTop: 24 }]}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>Retour</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
      {/* Reject modal */}
      <Modal visible={!!rejectTarget} animationType="slide" transparent onRequestClose={() => setRejectTarget(null)}>
        <ThemedView style={s.modalOverlay}>
          <ThemedView style={[s.modalContent, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
            <ThemedText style={{ fontWeight: '900', fontSize: 16, color: theme.text, marginBottom: 4 }}>Rejeter le dossier</ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13, marginBottom: 16 }}>
              {rejectTarget?.title || `#${rejectTarget?.id.slice(-8).toUpperCase()}`}
            </ThemedText>
            <ThemedText type="body" style={{ fontSize: 13, color: theme.onSurface + '70', marginBottom: 6 }}>Raison du rejet *</ThemedText>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Indiquez la raison du rejet (document manquant, titre invalide...)..."
              placeholderTextColor={theme.onSurface + '40'}
              multiline numberOfLines={3}
              style={[s.textArea, { backgroundColor: theme.surface, borderColor: theme.outline + '40', color: theme.text }]}
            />
            <ThemedView style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[s.modalBtn, { flex: 1, borderWidth: 1, borderColor: theme.outline + '50' }]} onPress={() => setRejectTarget(null)} disabled={submitting}>
                <ThemedText style={{ fontWeight: '700', color: theme.text }}>Annuler</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { flex: 2, backgroundColor: '#ef4444' }]} onPress={handleReject} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : (
                  <ThemedText style={{ fontWeight: '800', color: '#fff' }}>Rejeter</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Detail modal */}
      <Modal visible={!!detailTarget} animationType="slide" transparent onRequestClose={() => setDetailTarget(null)}>
        <ThemedView style={s.modalOverlay}>
          <ThemedView style={[s.detailContent, { backgroundColor: theme.surface, borderColor: theme.outline + '30' }]}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '900', fontSize: 16, color: theme.text }}>{detailTarget?.title || 'Dossier'}</ThemedText>
                <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>
                  {propertyLabel(detailTarget?.propertyId)} • {personLabel(detailTarget?.clientId)}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity onPress={() => setDetailTarget(null)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </ThemedView>

            <ScrollView style={{ maxHeight: 420 }}>
              {detailTarget?.description && (
                <ThemedText type="body" style={{ color: theme.onSurface + '80', fontSize: 13, marginBottom: 14 }}>
                  {detailTarget.description}
                </ThemedText>
              )}

              <ThemedText style={{ fontWeight: '800', fontSize: 13, color: theme.text, marginBottom: 8 }}>
                Documents ({detailTarget?.documents?.length ?? 0})
              </ThemedText>
              {(detailTarget?.documents?.length ?? 0) === 0 ? (
                <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 12, marginBottom: 14 }}>Aucun document déposé.</ThemedText>
              ) : (
                detailTarget?.documents?.map(doc => (
                  <ThemedView key={doc._id} style={[s.docRow, { borderColor: theme.outline + '20' }]}>
                    <MaterialCommunityIcons name="file-outline" size={16} color={theme.onSurface + '60'} />
                    <ThemedView style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: theme.text }} numberOfLines={1}>{doc.fileName}</ThemedText>
                      <ThemedText type="body" style={{ fontSize: 10, color: theme.onSurface + '50' }}>{doc.documentType}</ThemedText>
                    </ThemedView>
                    {doc.status === 'pending' ? (
                      <ThemedView style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity onPress={() => handleReviewDocument(doc._id, 'approved')}>
                          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReviewDocument(doc._id, 'rejected')}>
                          <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </ThemedView>
                    ) : (
                      <ThemedText style={{ fontSize: 10, fontWeight: '700', color: doc.status === 'approved' ? '#22c55e' : '#ef4444' }}>
                        {doc.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </ThemedText>
                    )}
                  </ThemedView>
                ))
              )}

              <ThemedText style={{ fontWeight: '800', fontSize: 13, color: theme.text, marginTop: 16, marginBottom: 8 }}>
                Commentaires ({detailTarget?.comments?.length ?? 0})
              </ThemedText>
              {detailTarget?.comments?.map(c => (
                <ThemedView key={c._id} style={[s.commentRow, { borderColor: theme.outline + '15' }]}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>
                    {personLabel(typeof c.authorId === 'string' ? undefined : c.authorId as any) || c.authorRole}
                  </ThemedText>
                  <ThemedText type="body" style={{ fontSize: 12, color: theme.text }}>{c.content}</ThemedText>
                </ThemedView>
              ))}
              <ThemedView style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Ajouter une note..."
                  placeholderTextColor={theme.onSurface + '40'}
                  style={[s.commentInput, { borderColor: theme.outline + '30', color: theme.text }]}
                />
                <TouchableOpacity
                  style={[s.sendBtn, { backgroundColor: theme.primary, opacity: commentText.trim() ? 1 : 0.5 }]}
                  onPress={handleAddComment}
                  disabled={!commentText.trim() || submitting}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>

            {['submitted', 'under_review'].includes(detailTarget?.status || '') && (
              <ThemedView style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[s.modalBtn, { flex: 1, backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef4444' }]}
                  onPress={() => { setRejectTarget(detailTarget); setRejectReason(''); }}
                >
                  <ThemedText style={{ fontWeight: '800', color: '#ef4444' }}>Rejeter</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalBtn, { flex: 2, backgroundColor: '#22c55e' }]}
                  onPress={() => detailTarget && handleValidate(detailTarget)}
                >
                  <ThemedText style={{ fontWeight: '800', color: '#fff' }}>Valider l'acte de vente</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ fontWeight: '900' }}>Dossiers notariaux</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 12 }}>{total} dossiers assignés</ThemedText>
        </ThemedView>
        <ThemedView style={[s.adminBadge, { backgroundColor: '#f59e0b15' }]}>
          <MaterialCommunityIcons name="gavel" size={14} color="#f59e0b" />
          <ThemedText type="body" style={{ color: '#f59e0b', fontSize: 11, fontWeight: '700' }}>NOTAIRE</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Status filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity key={f ?? 'all'} onPress={() => { setStatusFilter(f); setPage(1); }}
            style={[s.chip, { backgroundColor: statusFilter === f ? theme.primary : theme.surface, borderColor: statusFilter === f ? theme.primary : theme.outline + '30' }]}>
            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: statusFilter === f ? '#fff' : theme.onSurface + '70' }}>
              {f ? (STATUS_LABEL[f] ?? f) : 'Tous'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(page); }} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 48 }} />
        ) : dossiers.length === 0 ? (
          <ThemedView style={[s.emptyCard, { backgroundColor: theme.surface, borderColor: theme.outline + '20' }]}>
            <MaterialCommunityIcons name="folder-open-outline" size={56} color={theme.outline} />
            <ThemedText type="normaltitle" style={{ fontWeight: '800', marginTop: 12 }}>Aucun dossier assigné</ThemedText>
            <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              Les dossiers de vente vous seront transmis ici une fois assignés par un administrateur.
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 13 }}>
              {dossiers.length} dossiers — page {page}/{totalPages}
            </ThemedText>
            {dossiers.map(renderDossier)}
            {totalPages > 1 && (
              <ThemedView style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                <TouchableOpacity disabled={page <= 1} onPress={() => setPage(p => p - 1)} style={[s.pageBtn, { borderColor: theme.outline + '40', opacity: page <= 1 ? 0.4 : 1 }]}>
                  <Ionicons name="chevron-back" size={16} color={theme.text} />
                </TouchableOpacity>
                <ThemedView style={[s.pageBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}>
                  <ThemedText style={{ fontWeight: '700', color: theme.primary }}>{page}</ThemedText>
                </ThemedView>
                <TouchableOpacity disabled={page >= totalPages} onPress={() => setPage(p => p + 1)} style={[s.pageBtn, { borderColor: theme.outline + '40', opacity: page >= totalPages ? 0.4 : 1 }]}>
                  <Ionicons name="chevron-forward" size={16} color={theme.text} />
                </TouchableOpacity>
              </ThemedView>
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
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: 40, alignItems: 'center' },
  pageBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, paddingBottom: 36 },
  detailContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  textArea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, minHeight: 80, textAlignVertical: 'top' },
  modalBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cta: { height: 50, borderRadius: 25, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1 },
  commentRow: { paddingVertical: 6, borderBottomWidth: 1, gap: 2 },
  commentInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
