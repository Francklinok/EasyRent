import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/themehook';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuth } from '@/components/contexts/authContext/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import { useLanguage } from '@/components/contexts/language/LanguageContext';
import {
  UserMission,
  UserBadge,
  LevelDef,
} from '@/services/api/rewardsService';

type RewardsTab = 'missions' | 'badges' | 'leaderboard';

export default function RewardsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const {
    profile,
    leaderboard,
    loading,
    refreshing,
    refreshRewards,
    completeMission,
  } = useRewards();

  const [activeTab, setActiveTab] = useState<RewardsTab>('missions');
  const [claimingMission, setClaimingMission] = useState<string | null>(null);

  const handleClaimMission = async (mission: UserMission) => {
    if (mission.status === 'completed') return;
    if (mission.progress < mission.total) {
      Alert.alert(t('rewards.missionInProgress'), `${t('rewards.progression')} ${mission.progress}/${mission.total}`);
      return;
    }
    setClaimingMission(mission.missionId);
    try {
      const result = await completeMission(mission.missionId);
      if (result.leveledUp && result.newLevelName) {
        Alert.alert(t('rewards.levelUp'), `${t('rewards.congrats')} ${result.newLevelName}`);
      } else {
        Alert.alert(t('rewards.missionCompleted'), `+${result.xpAwarded} XP · +${result.tokensAwarded} RENT`);
      }
    } catch (err: any) {
      Alert.alert(t('rewards.errTitle'), err.message || t('rewards.errMsg'));
    } finally {
      setClaimingMission(null);
    }
  };

  const getLevelColor = (level: number, levels?: LevelDef[]) =>
    levels?.find(l => l.level === level)?.color || theme.primary;

  const xpProgressPct = profile
    ? Math.min(100, Math.round((profile.xp / profile.xpToNext) * 100))
    : 0;

  const userId = (user as any)?._id || (user as any)?.id;

  const TABS: { key: RewardsTab; label: string; icon: string }[] = [
    { key: 'missions', label: t('rewards.tabMissions'), icon: 'flag' },
    { key: 'badges', label: t('rewards.tabBadges'), icon: 'ribbon' },
    { key: 'leaderboard', label: t('rewards.tabLeaderboard'), icon: 'trophy' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.[0] || theme.surface }}>
      {/* Header */}
      <ThemedView style={[s.header, { borderBottomColor: theme.outline + '20' }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '900' }}>{t('rewards.title')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.onSurface + '60', fontSize: 11 }}>
            {t('rewards.rank')}{profile?.rank || '—'} {t('rewards.on')} {leaderboard.length > 0 ? leaderboard.length.toLocaleString() : '—'} {t('rewards.users')}
          </ThemedText>
        </ThemedView>
        <ThemedView style={[s.tokenBadge, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B40' }]}>
          <Ionicons name="logo-bitcoin" size={14} color={theme.star} />
          <ThemedText type="body" style={{ color: theme.star, fontWeight: '800', fontSize: 13 }}>
            {(profile?.totalRentTokens || 0).toLocaleString()}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.star, fontSize: 11 }}>RENT</ThemedText>
        </ThemedView>
      </ThemedView>

      {loading ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshRewards} tintColor={theme.primary} />}
        >
          {/* Level Card */}
          <ThemedView style={[s.levelCard, { backgroundColor: getLevelColor(profile?.level || 1, profile?.levels) }]}>
            <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
              <ThemedView>
                <ThemedText type="body" style={{ color: '#ffffff80', fontSize: 12 }}>{t('rewards.currentLevel')}</ThemedText>
                <ThemedText type="heading" style={{ color: '#fff', fontWeight: '900', fontSize: 22 }}>
                  {profile?.levelName || 'Visiteur'}
                </ThemedText>
              </ThemedView>
              <ThemedView style={[s.levelBadge, { backgroundColor: '#ffffff25' }]}>
                <ThemedText type="heading" style={{ color: '#fff', fontWeight: '900', fontSize: 28 }}>
                  {profile?.level || 1}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={{ gap: 6 }}>
              <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
                <ThemedText type="body" style={{ color: '#ffffff80', fontSize: 12 }}>{t('rewards.xpLabel')} {(profile?.xp || 0).toLocaleString()}</ThemedText>
                <ThemedText type="body" style={{ color: '#ffffff80', fontSize: 12 }}>{t('rewards.nextLabel')} {(profile?.xpToNext || 500).toLocaleString()} {t('rewards.xpSuffix')}</ThemedText>
              </ThemedView>
              <ThemedView style={[s.xpTrack, { backgroundColor: '#ffffff25' }]}>
                <ThemedView style={[s.xpFill, { width: `${xpProgressPct}%` as any }]} />
              </ThemedView>
            </ThemedView>
            <ThemedView style={[s.row, { gap: 8 }]}>
              <ThemedView style={[s.row, { gap: 4, backgroundColor: '#ffffff20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }]}>
                <Ionicons name="flame" size={14} color="#FCD34D" />
                <ThemedText type="body" style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{profile?.streak || 0} {t('rewards.days')}</ThemedText>
              </ThemedView>
              <ThemedView style={[s.row, { gap: 4, backgroundColor: '#ffffff20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }]}>
                <Ionicons name="trophy" size={14} color="#FCD34D" />
                <ThemedText type="body" style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>#{profile?.rank || '—'}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Tabs */}
          <ThemedView style={[s.tabBar, { borderBottomColor: theme.outline + '20', backgroundColor: theme.surface }]}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, activeTab === tab.key && { borderBottomWidth: 2, borderBottomColor: theme.primary }]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? theme.primary : theme.onSurface + '50'} />
                <ThemedText type="body" style={{ color: activeTab === tab.key ? theme.primary : theme.onSurface + '60', fontSize: 12, fontWeight: activeTab === tab.key ? '700' : '500' }}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          {/* ── MISSIONS ── */}
          {activeTab === 'missions' && (
            <>
              {(profile?.missions || []).length === 0 ? (
                <ThemedView style={[s.emptyState, { borderColor: theme.outline + '20' }]}>
                  <Ionicons name="flag-outline" size={40} color={theme.onSurface + '30'} />
                  <ThemedText type="body" style={{ color: theme.onSurface + '50', marginTop: 8 }}>{t('rewards.noMissions')}</ThemedText>
                </ThemedView>
              ) : (
                (profile?.missions || []).map(mission => {
                  const pct = Math.min(100, Math.round((mission.progress / mission.total) * 100));
                  const isClaiming = claimingMission === mission.missionId;
                  const canClaim = mission.status !== 'completed' && mission.progress >= mission.total;

                  return (
                    <ThemedView
                      key={mission.missionId}
                      style={[s.missionCard, {
                        backgroundColor: mission.status === 'completed' ? mission.color + '10' : theme.surface,
                        borderColor: mission.status === 'completed' ? mission.color + '30' : theme.outline + '20',
                      }]}
                    >
                      <ThemedView style={[s.row, { gap: 12 }]}>
                        <ThemedView style={[s.missionIcon, { backgroundColor: mission.color + '18' }]}>
                          <Ionicons name={mission.icon as any} size={20} color={mission.color} />
                        </ThemedView>
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedView style={[s.row, { justifyContent: 'space-between' }]}>
                            <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', fontSize: 14, flex: 1 }}>
                              {mission.title}
                            </ThemedText>
                            {mission.status === 'completed' ? (
                              <ThemedView style={[{ backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }]}>
                                <ThemedText type="body" style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>{t('rewards.done')}</ThemedText>
                              </ThemedView>
                            ) : (
                              <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 12 }}>
                                {mission.progress}/{mission.total}
                              </ThemedText>
                            )}
                          </ThemedView>
                          <ThemedView style={[s.row, { gap: 10, marginTop: 4 }]}>
                            <ThemedText type="body" style={{ color: '#6366F1', fontSize: 12, fontWeight: '700' }}>+{mission.xpReward} XP</ThemedText>
                            <ThemedText type="body" style={{ color: '#F59E0B', fontSize: 12, fontWeight: '700' }}>+{mission.tokensReward} RENT</ThemedText>
                          </ThemedView>
                        </ThemedView>
                      </ThemedView>

                      {mission.status !== 'completed' && (
                        <ThemedView style={{ gap: 6 }}>
                          <ThemedView style={[s.progressTrack, { backgroundColor: theme.outline + '20' }]}>
                            <ThemedView style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: mission.color }]} />
                          </ThemedView>
                          {canClaim && (
                            <TouchableOpacity
                              style={[s.claimBtn, { backgroundColor: mission.color }]}
                              onPress={() => handleClaimMission(mission)}
                              disabled={isClaiming}
                            >
                              {isClaiming ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <ThemedText type="body" style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                                  {t('rewards.claimReward')}
                                </ThemedText>
                              )}
                            </TouchableOpacity>
                          )}
                        </ThemedView>
                      )}
                    </ThemedView>
                  );
                })
              )}
            </>
          )}

          {/* ── BADGES ── */}
          {activeTab === 'badges' && (
            <ThemedView style={s.badgesGrid}>
              {(profile?.availableBadges || []).map(badge => {
                const earned = profile?.badges.find(b => b.badgeId === badge.badgeId);
                return (
                  <ThemedView
                    key={badge.badgeId}
                    style={[s.badgeCard, {
                      backgroundColor: earned ? badge.color + '15' : theme.surface,
                      borderColor: earned ? badge.color + '40' : theme.outline + '20',
                      opacity: earned ? 1 : 0.45,
                    }]}
                  >
                    <ThemedView style={[s.badgeIconCircle, { backgroundColor: earned ? badge.color + '20' : theme.outline + '10' }]}>
                      <Ionicons name={badge.icon as any} size={24} color={earned ? badge.color : theme.onSurface + '30'} />
                    </ThemedView>
                    <ThemedText type="body" style={{ color: earned ? theme.text : theme.onSurface + '40', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
                      {badge.name}
                    </ThemedText>
                    {earned && (
                      <ThemedText type="body" style={{ color: badge.color, fontSize: 9, textAlign: 'center' }}>
                        {new Date((earned as UserBadge).earnedAt).toLocaleDateString('fr-FR')}
                      </ThemedText>
                    )}
                  </ThemedView>
                );
              })}
            </ThemedView>
          )}

          {/* ── LEADERBOARD ── */}
          {activeTab === 'leaderboard' && (
            <>
              {leaderboard.slice(0, 25).map(entry => {
                const isMe = entry.userId === userId;
                const rankColor = entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#9CA3AF' : entry.rank === 3 ? '#CD7F32' : theme.onSurface + '60';

                return (
                  <ThemedView
                    key={entry.userId + entry.rank}
                    style={[s.lbRow, {
                      backgroundColor: isMe ? theme.primary + '12' : theme.surface,
                      borderColor: isMe ? theme.primary + '40' : theme.outline + '20',
                    }]}
                  >
                    <ThemedText type="normaltitle" style={{ color: rankColor, fontWeight: '900', fontSize: 16, width: 32 }}>
                      #{entry.rank}
                    </ThemedText>
                    <ThemedView style={[s.avatarCircle, { backgroundColor: theme.primary + '20' }]}>
                      <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>
                        {entry.name.charAt(0).toUpperCase()}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={{ flex: 1 }}>
                      <ThemedView style={[s.row, { gap: 6 }]}>
                        <ThemedText type="normaltitle" style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{entry.name}</ThemedText>
                        {isMe && (
                          <ThemedView style={[{ backgroundColor: theme.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }]}>
                            <ThemedText type="body" style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{t('rewards.youLabel')}</ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>
                      <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>{entry.levelName}</ThemedText>
                    </ThemedView>
                    <ThemedView style={{ alignItems: 'flex-end' }}>
                      <ThemedText type="normaltitle" style={{ color: theme.primary, fontWeight: '900' }}>{entry.xp.toLocaleString()}</ThemedText>
                      <ThemedText type="body" style={{ color: theme.onSurface + '50', fontSize: 11 }}>XP</ThemedText>
                    </ThemedView>
                  </ThemedView>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 4 },
  tokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  levelCard: { borderRadius: 20, padding: 20, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  xpTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#ffffff', borderRadius: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderRadius: 14 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 3 },
  missionCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  missionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  claimBtn: { height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '30%', borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
  badgeIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 16, borderWidth: 1 },
});
