/**
 * TenantRatingScreen
 * Permet au propriétaire de noter un locataire après la fin du bail.
 * Critères : paiement ponctuel, respect du bien, communication, départ.
 */
import React, { useState } from 'react';
import {
  ScrollView, TouchableOpacity, TextInput, Alert,
  ActivityIndicator, StyleSheet, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import { getBookingService } from '@/services/api/bookingService';

interface RatingCriterion {
  id:      string;
  label:   string;
  icon:    string;
  score:   number;
}

const DEFAULT_CRITERIA: Omit<RatingCriterion, 'score'>[] = [
  { id: 'payment',       label: '', icon: 'cash-clock'        },
  { id: 'property',      label: '', icon: 'home-heart'        },
  { id: 'communication', label: '', icon: 'message-text'      },
  { id: 'departure',     label: '', icon: 'door-open'         },
  { id: 'neighbors',     label: '', icon: 'account-group'     },
];

const StarRow = ({ score, onPress }: { score: number; onPress: (s: number) => void }) => (
  <View style={{ flexDirection: 'row', gap: 6 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <TouchableOpacity key={s} onPress={() => onPress(s)} activeOpacity={0.8}>
        <MaterialCommunityIcons
          name={s <= score ? 'star' : 'star-outline'}
          size={28}
          color={s <= score ? '#F59E0B' : '#D1D5DB'}
        />
      </TouchableOpacity>
    ))}
  </View>
);

export default function TenantRatingScreen() {
  const { theme }      = useTheme();
  const { t }          = useLanguage();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();

  const [criteria, setCriteria] = useState<RatingCriterion[]>(
    DEFAULT_CRITERIA.map(c => ({ ...c, score: 0 })),
  );
  const [comment, setComment]   = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bookingService = getBookingService();

  const avgScore = criteria.length > 0
    ? criteria.reduce((s, c) => s + c.score, 0) / criteria.length
    : 0;

  const setScore = (id: string, score: number) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, score } : c));
  };

  const handleSubmit = async () => {
    const unrated = criteria.filter(c => c.score === 0);
    if (unrated.length > 0) {
      Alert.alert(t('common.error'), t('tenantRating.errIncompleteRating'));
      return;
    }
    if (recommend === null) {
      Alert.alert(t('common.error'), t('tenantRating.errNoRecommend'));
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.rateTenant({
        activityId: activityId!,
        criteria: criteria.map(c => ({ id: c.id, score: c.score })),
        comment,
        recommend,
        overallScore: avgScore,
      });
      Alert.alert(t('tenantRating.successTitle'), t('tenantRating.successMsg'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(t('common.error'), t('tenantRating.errSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const scoreColor = avgScore >= 4 ? '#10B981' : avgScore >= 3 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={{ padding: 16, gap: 20 }}>

          {/* Score global preview */}
          <ThemedView style={[styles.globalCard, { borderColor: scoreColor + '30', backgroundColor: scoreColor + '08' }]}>
            <ThemedText style={[styles.globalScore, { color: scoreColor }]}>
              {avgScore.toFixed(1)}/5
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <MaterialCommunityIcons
                  key={s}
                  name={s <= Math.round(avgScore) ? 'star' : 'star-outline'}
                  size={20}
                  color={scoreColor}
                />
              ))}
            </View>
            <ThemedText style={[styles.globalLabel, { color: scoreColor }]}>
              {avgScore >= 4.5 ? t('tenantRating.excellent') : avgScore >= 3.5 ? t('tenantRating.good') : avgScore >= 2.5 ? t('tenantRating.average') : t('tenantRating.avoid')}
            </ThemedText>
          </ThemedView>

          {/* Critères */}
          <ThemedView style={[styles.section, { borderColor: theme.outline + '25' }]}>
            <ThemedText style={styles.sectionTitle}>{t('tenantRating.criteriaSection')}</ThemedText>
            <View style={{ gap: 16 }}>
              {criteria.map(c => (
                <View key={c.id} style={styles.criterionRow}>
                  <View style={styles.criterionLabel}>
                    <MaterialCommunityIcons name={c.icon as any} size={18} color={theme.onSurface + '70'} />
                    <ThemedText style={{ fontSize: 14, flex: 1 }}>{t(`tenantRating.criterion${c.id.charAt(0).toUpperCase() + c.id.slice(1)}` as any)}</ThemedText>
                  </View>
                  <StarRow score={c.score} onPress={s => setScore(c.id, s)} />
                </View>
              ))}
            </View>
          </ThemedView>

          {/* Recommandation */}
          <ThemedView style={[styles.section, { borderColor: theme.outline + '25' }]}>
            <ThemedText style={styles.sectionTitle}>{t('tenantRating.recommendSection')}</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>{t('tenantRating.recommendQuestion')}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setRecommend(true)}
                style={[
                  styles.recBtn,
                  recommend === true ? { backgroundColor: '#10B981', borderColor: '#10B981' } : { borderColor: '#10B981' + '50' },
                ]}
              >
                <MaterialCommunityIcons name="thumb-up" size={20} color={recommend === true ? '#fff' : '#10B981'} />
                <ThemedText style={{ color: recommend === true ? '#fff' : '#10B981', fontWeight: '700' }}>{t('tenantRating.yes')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRecommend(false)}
                style={[
                  styles.recBtn,
                  recommend === false ? { backgroundColor: '#EF4444', borderColor: '#EF4444' } : { borderColor: '#EF4444' + '50' },
                ]}
              >
                <MaterialCommunityIcons name="thumb-down" size={20} color={recommend === false ? '#fff' : '#EF4444'} />
                <ThemedText style={{ color: recommend === false ? '#fff' : '#EF4444', fontWeight: '700' }}>{t('tenantRating.no')}</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Commentaire */}
          <ThemedView style={[styles.section, { borderColor: theme.outline + '25' }]}>
            <ThemedText style={styles.sectionTitle}>{t('tenantRating.commentSection')}</ThemedText>
            <TextInput
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              placeholder={t('tenantRating.commentPlaceholder')}
              placeholderTextColor={theme.onSurface + '40'}
              style={[styles.commentInput, { borderColor: theme.outline + '40', color: theme.text, backgroundColor: theme.surfaceVariant }]}
            />
          </ThemedView>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }]}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <MaterialCommunityIcons name="send" size={20} color="#fff" />}
            <ThemedText style={styles.submitText}>{t('tenantRating.submitBtn')}</ThemedText>
          </TouchableOpacity>

        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  globalCard:   { alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, gap: 6 },
  globalScore:  { fontSize: 36, fontWeight: '900' },
  globalLabel:  { fontSize: 14, fontWeight: '600' },

  section:      { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionSubtitle:{ fontSize: 13, opacity: 0.6 },

  criterionRow: { gap: 8 },
  criterionLabel:{ flexDirection: 'row', alignItems: 'center', gap: 8 },

  recBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 2,
  },

  commentInput: {
    borderWidth: 1, borderRadius: 12, padding: 12,
    fontSize: 14, lineHeight: 20, minHeight: 100, textAlignVertical: 'top',
  },

  submitBtn:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
