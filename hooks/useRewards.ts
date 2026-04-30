import { useState, useEffect, useCallback } from 'react';
import rewardsService, {
  UserRewardsProfile,
  LeaderboardEntry,
  UserMission,
  UserBadge,
} from '@/services/api/rewardsService';
import { getAuthToken } from '@/hooks/useAuthToken';

interface UseRewardsResult {
  profile: UserRewardsProfile | null;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshRewards: () => Promise<void>;
  completeMission: (missionId: string) => Promise<any>;
  updateProgress: (missionId: string, increment?: number) => Promise<boolean>;
  unlockBadge: (badgeId: string) => Promise<UserBadge | null>;
}

export function useRewards(): UseRewardsResult {
  const [profile, setProfile] = useState<UserRewardsProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRewards = useCallback(async (isRefresh = false) => {
    const token = await getAuthToken();
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      const [rewardsRes, lbRes] = await Promise.allSettled([
        rewardsService.getMyRewards(token),
        rewardsService.getLeaderboard(),
      ]);

      if (rewardsRes.status === 'fulfilled') {
        setProfile(rewardsRes.value.rewards);
      } else {
        throw rewardsRes.reason;
      }

      if (lbRes.status === 'fulfilled') {
        setLeaderboard(lbRes.value.leaderboard);
      }
    } catch (err) {
      console.error('Error loading rewards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshRewards = useCallback(async () => {
    await loadRewards(true);
  }, [loadRewards]);

  const completeMission = useCallback(async (missionId: string) => {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const result = await rewardsService.completeMission(token, missionId);
      // Update local profile state after completion
      if (profile) {
        setProfile({
          ...profile,
          xp: result.totalXp,
          totalRentTokens: result.totalTokens,
          level: result.newLevel ?? profile.level,
          levelName: result.newLevelName ?? profile.levelName,
          missions: profile.missions.map(m =>
            m.missionId === missionId ? { ...m, status: 'completed', progress: m.total } : m
          ),
        });
      }
      return result;
    } catch (err) {
      console.error('Error completing mission:', err);
      throw err;
    }
  }, [profile]);

  const updateProgress = useCallback(async (missionId: string, increment = 1) => {
    const token = await getAuthToken();
    if (!token) return false;

    try {
      const result = await rewardsService.updateMissionProgress(token, missionId, increment);
      if (profile) {
        setProfile({
          ...profile,
          missions: profile.missions.map(m =>
            m.missionId === missionId ? { ...m, progress: result.mission.progress, status: result.mission.status } : m
          ),
        });
      }
      return true;
    } catch (err) {
      console.error('Error updating mission progress:', err);
      return false;
    }
  }, [profile]);

  const unlockBadge = useCallback(async (badgeId: string) => {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const result = await rewardsService.unlockBadge(token, badgeId);
      if (profile) {
        setProfile({
          ...profile,
          badges: [...profile.badges, result.badge],
        });
      }
      return result.badge;
    } catch (err) {
      console.error('Error unlocking badge:', err);
      return null;
    }
  }, [profile]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  return {
    profile,
    leaderboard,
    loading,
    refreshing,
    error,
    refreshRewards,
    completeMission,
    updateProgress,
    unlockBadge,
  };
}

export default useRewards;
