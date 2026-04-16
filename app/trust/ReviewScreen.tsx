/**
 * ReviewScreen
 * Système d'avis universel : propriété, propriétaire, locataire.
 * Connecté au backend via reviewService.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView, RefreshControl, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, StyleSheet, View, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import reviewService, { Review, ReviewTargetType, ReviewStats } from '@/services/api/reviewService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 16, interactive = false, onRate }: {
  rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void;
}) => (
  <View style={{ flexDirection: 'row', gap: 3 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <TouchableOpacity key={s} onPress={() => onRate?.(s)} disabled={!interactive} activeOpacity={0.7}>
        <MaterialCommunityIcons
          name={s <= rating ? 'star' : s - 0.5 <= rating ? 'star-half-full' : 'star-outline'}
          size={size}
          color="#F59E0B"
        />
      </TouchableOpacity>
    ))}
  </View>
);

const ratingColor = (r: number) => r >= 4 ? '#10B981' : r >= 3 ? '#F59E0B' : '#EF4444';

const RATING_WORDS: Record<number, string> = {
  5: 'Excellent',
  4: 'Très bien',
  3: 'Correct',
  2: 'Décevant',
  1: 'Mauvais',
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReviewScreen() {
  const { theme } = useTheme();
  const { targetId, targetType = 'property', targetName } =
    useLocalSearchParams<{ targetId: string; targetType: ReviewTargetType; targetName: string }>();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadReviews = useCallback(async (reset = false) => {
    if (!targetId) { setLoading(false); return; }
    try {
      const p = reset ? 1 : page;
      const [reviewsRes, statsRes] = await Promise.allSettled([
        reviewService.getReviews(targetId, (targetType || 'property') as ReviewTargetType, p),
        reset ? reviewService.getStats(targetId, (targetType || 'property') as ReviewTargetType) : Promise.resolve(null),
      ]);

      if (reviewsRes.status === 'fulfilled') {
        setReviews(prev => reset ? reviewsRes.value.reviews : [...prev, ...reviewsRes.value.reviews]);
        setHasMore(p < reviewsRes.value.pagination.pages);
        if (!reset) setPage(p + 1);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value.stats);
      }
    } catch {
      // Use local computed stats
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetId, targetType, page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadReviews(true);
  }, [targetId, targetType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadReviews(true);
  }, [loadReviews]);

  // Compute stats locally if backend didn't return them
  const computedStats = useMemo(() => {
    if (stats) return stats;
    if (!reviews.length) return null;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const distribution = [1, 2, 3, 4, 5].map(
      star => reviews.filter(r => Math.round(r.rating) === star).length
    );
    return { average: Math.round(avg * 10) / 10, total: reviews.length, distribution };
  }, [stats, reviews]);

  const handleSubmit = async () => {
    if (newRating === 0) { Alert.alert('Note requise', 'Sélectionnez une note.'); return; }
    if (newComment.trim().length < 10) { Alert.alert('Commentaire trop court', 'Minimum 10 caractères.'); return; }
    if (!targetId) { Alert.alert('Erreur', 'Cible non spécifiée'); return; }

    const token = await AsyncStorage.getItem('@auth_access_token');
    if (!token) { Alert.alert('Connexion requise', 'Vous devez être connecté pour laisser un avis.'); return; }

    setSubmitting(true);
    try {
      const res = await reviewService.createReview(token, {
        targetId,
        targetType: (targetType || 'property') as ReviewTargetType,
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews(prev => [res.review, ...prev]);
      // Refresh stats
      reviewService.getStats(targetId, (targetType || 'property') as ReviewTargetType)
        .then(r => setStats(r.stats))
        .catch(() => {});
      setShowForm(false);
      setNewRating(0);
      setNewComment('');
      Alert.alert('Merci !', 'Votre avis a été publié.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de publier l\'avis.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background[0] }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <ThemedView style={{ padding: 16, gap: 20 }}>
          {/* Target name */}
          {targetName && (
            <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '800', fontSize: 18 }}>
              {targetName}
            </ThemedText>
          )}

          {loading ? (
            <ThemedView style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
          ) : (
            <>
              {/* Stats Card */}
              {computedStats && (
                <ThemedView style={[styles.statsCard, { borderColor: theme.outline + '25' }]}>
                  <View style={styles.statsLeft}>
                    <ThemedText style={[styles.avgScore, { color: ratingColor(computedStats.average) }]}>
                      {computedStats.average.toFixed(1)}
                    </ThemedText>
                    <Stars rating={computedStats.average} size={18} />
                    <ThemedText style={[styles.reviewCount, { color: theme.onSurface + '50' }]}>
                      {computedStats.total} avis
                    </ThemedText>
                  </View>
                  <View style={styles.statsRight}>
                    {[5, 4, 3, 2, 1].map((star, i) => {
                      const count = computedStats.distribution[star - 1];
                      const pct = computedStats.total > 0 ? (count / computedStats.total) * 100 : 0;
                      return (
                        <View key={star} style={styles.distRow}>
                          <ThemedText style={[styles.distStar, { color: theme.text }]}>{star}</ThemedText>
                          <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                          <View style={styles.distTrack}>
                            <View style={[styles.distFill, { width: `${pct}%` as any, backgroundColor: ratingColor(star) }]} />
                          </View>
                          <ThemedText style={[styles.distCount, { color: theme.onSurface + '50' }]}>{count}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                </ThemedView>
              )}

              {/* CTA */}
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                style={[styles.addReviewBtn, { backgroundColor: theme.primary }]}
              >
                <MaterialCommunityIcons name="pencil-plus" size={18} color="#fff" />
                <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Laisser un avis</ThemedText>
              </TouchableOpacity>

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <ThemedView style={styles.empty}>
                  <MaterialCommunityIcons name="comment-outline" size={48} color={theme.onSurface + '30'} />
                  <ThemedText style={{ marginTop: 12, opacity: 0.5, color: theme.text }}>Aucun avis pour le moment.</ThemedText>
                </ThemedView>
              ) : (
                <View style={{ gap: 12 }}>
                  {reviews.map(review => (
                    <ReviewCard key={review._id} review={review} theme={theme} />
                  ))}
                </View>
              )}

              {/* Load more */}
              {hasMore && reviews.length > 0 && (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { borderColor: theme.outline + '30' }]}
                  onPress={() => loadReviews(false)}
                >
                  <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>Charger plus d'avis</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </ThemedView>
      </ScrollView>

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background[0] }}>
          <ScrollView>
            <ThemedView style={{ padding: 20, gap: 20 }}>
              <View style={styles.modalHeader}>
                <ThemedText style={[styles.modalTitle, { color: theme.text }]}>Votre avis</ThemedText>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.onSurface} />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <ThemedText style={[styles.formLabel, { color: theme.text }]}>Note globale *</ThemedText>
                <Stars rating={newRating} size={36} interactive onRate={setNewRating} />
                {newRating > 0 && (
                  <ThemedText style={[styles.ratingWord, { color: ratingColor(newRating) }]}>
                    {RATING_WORDS[newRating]}
                  </ThemedText>
                )}
              </View>

              <View style={styles.formSection}>
                <ThemedText style={[styles.formLabel, { color: theme.text }]}>Commentaire *</ThemedText>
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  numberOfLines={5}
                  placeholder="Partagez votre expérience (minimum 10 caractères)…"
                  placeholderTextColor={theme.onSurface + '40'}
                  style={[styles.textarea, {
                    borderColor: theme.outline + '40',
                    color: theme.text,
                    backgroundColor: theme.surfaceVariant,
                  }]}
                />
                <ThemedText style={[styles.charCount, { color: newComment.length < 10 ? '#EF4444' : theme.onSurface + '50' }]}>
                  {newComment.length} / min. 10 caractères
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }]}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <MaterialCommunityIcons name="send" size={18} color="#fff" />}
                <ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Publier</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── ReviewCard ────────────────────────────────────────────────────────────────

const ReviewCard = ({ review, theme }: { review: Review; theme: any }) => (
  <ThemedView style={[styles.reviewCard, { borderColor: theme.outline + '20' }]}>
    <View style={styles.reviewHeader}>
      <View style={[styles.authorAvatar, { backgroundColor: theme.primary + '20' }]}>
        <ThemedText style={[styles.authorInitial, { color: theme.primary }]}>
          {review.authorName[0].toUpperCase()}
        </ThemedText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.reviewMeta}>
          <ThemedText style={[styles.authorName, { color: theme.text }]}>{review.authorName}</ThemedText>
          {review.isVerified && (
            <View style={styles.verifiedChip}>
              <MaterialCommunityIcons name="check-decagram" size={12} color="#10B981" />
              <ThemedText style={styles.verifiedChipText}>Vérifié</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.ratingDateRow}>
          <Stars rating={review.rating} size={13} />
          <ThemedText style={[styles.reviewDate, { color: theme.onSurface + '50' }]}>
            {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </ThemedText>
        </View>
      </View>
    </View>

    <ThemedText style={[styles.reviewComment, { color: theme.text }]}>{review.comment}</ThemedText>

    {review.criteria && review.criteria.length > 0 && (
      <View style={styles.criteriaRow}>
        {review.criteria.map((c, i) => (
          <View key={i} style={[styles.criteriaPill, { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + '20' }]}>
            <ThemedText style={[styles.criteriaLabel, { color: theme.text }]}>{c.label}</ThemedText>
            <Stars rating={c.score} size={10} />
          </View>
        ))}
      </View>
    )}

    {review.reply && (
      <View style={[styles.replyBox, { backgroundColor: theme.surfaceVariant, borderColor: theme.outline + '30' }]}>
        <MaterialCommunityIcons name="reply" size={14} color={theme.onSurface + '60'} />
        <ThemedText style={[styles.replyText, { color: theme.onSurface + '80' }]}>
          {typeof review.reply === 'string' ? review.reply : review.reply.comment}
        </ThemedText>
      </View>
    )}
  </ThemedView>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  statsCard: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 16 },
  statsLeft: { alignItems: 'center', gap: 6, minWidth: 80 },
  avgScore: { fontSize: 42, fontWeight: '900', lineHeight: 44 },
  reviewCount: { fontSize: 11 },
  statsRight: { flex: 1, gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  distStar: { fontSize: 11, width: 10 },
  distTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 3 },
  distCount: { fontSize: 10, width: 14, textAlign: 'right' },
  addReviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  reviewHeader: { flexDirection: 'row', gap: 10 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { fontSize: 16, fontWeight: '700' },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontWeight: '700', fontSize: 14 },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#10B98115', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedChipText: { fontSize: 10, color: '#10B981', fontWeight: '700' },
  ratingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 14, lineHeight: 20 },
  criteriaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  criteriaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  criteriaLabel: { fontSize: 11 },
  replyBox: { flexDirection: 'row', gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  replyText: { fontSize: 12, flex: 1, lineHeight: 17 },
  loadMoreBtn: { alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 14, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  formSection: { gap: 8 },
  formLabel: { fontWeight: '700', fontSize: 15 },
  ratingWord: { fontSize: 14, fontWeight: '700' },
  textarea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 120 },
  charCount: { fontSize: 12 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
});
