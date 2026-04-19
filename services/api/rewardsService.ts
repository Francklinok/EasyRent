import { API_CONFIG } from '../../constants/apiConfig';

export type MissionStatus = 'pending' | 'in_progress' | 'completed';

export interface UserBadge {
  badgeId: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface UserMission {
  missionId: string;
  title: string;
  xpReward: number;
  tokensReward: number;
  progress: number;
  total: number;
  status: MissionStatus;
  icon: string;
  color: string;
  completedAt?: string;
}

export interface LevelDef {
  level: number;
  name: string;
  xpRequired: number;
  color: string;
}

export interface AvailableBadge {
  badgeId: string;
  name: string;
  icon: string;
  color: string;
}

export interface UserRewardsProfile {
  _id: string;
  userId: string;
  level: number;
  levelName: string;
  xp: number;
  xpToNext: number;
  totalRentTokens: number;
  streak: number;
  rank: number;
  badges: UserBadge[];
  missions: UserMission[];
  levels: LevelDef[];
  availableBadges: AvailableBadge[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  levelName: string;
  tokens: number;
}

const BASE = `${API_CONFIG.BASE_URL}/api/rewards`;

const rewardsService = {
  getMyRewards: async (token: string): Promise<{ success: boolean; rewards: UserRewardsProfile }> => {
    const res = await fetch(`${BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erreur chargement récompenses');
    return json;
  },

  completeMission: async (
    token: string,
    missionId: string
  ): Promise<{
    success: boolean;
    xpAwarded: number;
    tokensAwarded: number;
    leveledUp: boolean;
    newLevel: number | null;
    newLevelName: string | null;
    totalXp: number;
    totalTokens: number;
  }> => {
    const res = await fetch(`${BASE}/missions/${missionId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erreur complétion mission');
    return json;
  },

  updateMissionProgress: async (
    token: string,
    missionId: string,
    increment = 1
  ): Promise<{ success: boolean; mission: Pick<UserMission, 'missionId' | 'progress' | 'total' | 'status'>; completed: boolean }> => {
    const res = await fetch(`${BASE}/missions/${missionId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ increment }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erreur progression mission');
    return json;
  },

  unlockBadge: async (
    token: string,
    badgeId: string
  ): Promise<{ success: boolean; badge: UserBadge }> => {
    const res = await fetch(`${BASE}/badges/${badgeId}/unlock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erreur déblocage badge');
    return json;
  },

  getLeaderboard: async (): Promise<{ success: boolean; leaderboard: LeaderboardEntry[] }> => {
    const res = await fetch(`${BASE}/leaderboard`);
    if (!res.ok) throw new Error('Erreur classement');
    return res.json();
  },
};

export default rewardsService;
