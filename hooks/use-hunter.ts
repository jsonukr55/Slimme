import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HunterProfile,
  HunterRank,
  HunterStats,
  Trophy,
} from '@/types/hunter';
import {
  RANK_XP_THRESHOLDS,
  RANK_TITLES,
  LEVELS_PER_RANK,
  XP_PER_LEVEL,
} from '@/constants/hunter-quests';
import { TROPHY_DEFINITIONS } from '@/constants/hunter-trophies';

const HUNTER_PROFILE_KEY = 'hunter_profile';
const HUNTER_TROPHIES_KEY = 'hunter_trophies';

const DEFAULT_STATS: HunterStats = {
  strength: 1,
  agility: 1,
  vitality: 1,
  intelligence: 1,
  sense: 1,
};

const DEFAULT_PROFILE: HunterProfile = {
  isActive: false,
  rank: 'E',
  level: 1,
  totalXP: 0,
  currentLevelXP: 0,
  nextLevelXP: XP_PER_LEVEL,
  title: RANK_TITLES['E'],
  stats: DEFAULT_STATS,
  questsCompleted: 0,
  longestStreak: 0,
  currentStreak: 0,
};

function getRankForXP(totalXP: number): HunterRank {
  const ranks: HunterRank[] = ['National', 'S', 'A', 'B', 'C', 'D', 'E'];
  for (const rank of ranks) {
    if (totalXP >= RANK_XP_THRESHOLDS[rank]) return rank;
  }
  return 'E';
}

function getLevelInfo(totalXP: number, rank: HunterRank) {
  const rankXP = RANK_XP_THRESHOLDS[rank];
  const xpInRank = totalXP - rankXP;
  const level = Math.min(Math.floor(xpInRank / XP_PER_LEVEL) + 1, LEVELS_PER_RANK);
  const currentLevelXP = xpInRank % XP_PER_LEVEL;
  return { level, currentLevelXP, nextLevelXP: XP_PER_LEVEL };
}

export function useHunter() {
  const [profile, setProfile] = useState<HunterProfile>(DEFAULT_PROFILE);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [profileRaw, trophiesRaw] = await Promise.all([
        AsyncStorage.getItem(HUNTER_PROFILE_KEY),
        AsyncStorage.getItem(HUNTER_TROPHIES_KEY),
      ]);

      if (profileRaw) setProfile(JSON.parse(profileRaw));

      if (trophiesRaw) {
        setTrophies(JSON.parse(trophiesRaw));
      } else {
        // Seed trophies from definitions
        const seeded: Trophy[] = TROPHY_DEFINITIONS.map((def) => ({
          ...def,
          starsEarned: 0,
          currentValue: 0,
        }));
        setTrophies(seeded);
        await AsyncStorage.setItem(HUNTER_TROPHIES_KEY, JSON.stringify(seeded));
      }
    } finally {
      setLoading(false);
    }
  };

  const activateHunterMode = useCallback(async () => {
    const updated: HunterProfile = {
      ...DEFAULT_PROFILE,
      isActive: true,
      activatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(HUNTER_PROFILE_KEY, JSON.stringify(updated));
    setProfile(updated);
  }, []);

  const deactivateHunterMode = useCallback(async () => {
    const updated = { ...profile, isActive: false };
    await AsyncStorage.setItem(HUNTER_PROFILE_KEY, JSON.stringify(updated));
    setProfile(updated);
  }, [profile]);

  const resetHunterMode = useCallback(async () => {
    const freshTrophies = TROPHY_DEFINITIONS.map((def) => ({
      ...def,
      starsEarned: 0,
      currentValue: 0,
    }));
    await AsyncStorage.multiRemove([HUNTER_PROFILE_KEY, HUNTER_TROPHIES_KEY]);
    // Also clear all quest keys
    const allKeys = await AsyncStorage.getAllKeys();
    const questKeys = allKeys.filter(
      (k) => k.startsWith('hunter_quests_') || k.startsWith('hunter_weekly_quests') || k === 'hunter_custom_quests'
    );
    if (questKeys.length > 0) await AsyncStorage.multiRemove(questKeys);
    setProfile(DEFAULT_PROFILE);
    setTrophies(freshTrophies);
  }, []);

  const addXP = useCallback(
    async (xp: number, statReward: Partial<HunterStats> = {}) => {
      const newTotalXP = profile.totalXP + xp;
      const newRank = getRankForXP(newTotalXP);
      const { level, currentLevelXP, nextLevelXP } = getLevelInfo(newTotalXP, newRank);

      const newStats: HunterStats = {
        strength: profile.stats.strength + (statReward.strength || 0),
        agility: profile.stats.agility + (statReward.agility || 0),
        vitality: profile.stats.vitality + (statReward.vitality || 0),
        intelligence: profile.stats.intelligence + (statReward.intelligence || 0),
        sense: profile.stats.sense + (statReward.sense || 0),
      };

      const updated: HunterProfile = {
        ...profile,
        totalXP: newTotalXP,
        rank: newRank,
        level,
        currentLevelXP,
        nextLevelXP,
        title: RANK_TITLES[newRank],
        stats: newStats,
        questsCompleted: profile.questsCompleted + 1,
      };

      await AsyncStorage.setItem(HUNTER_PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);

      return { rankUp: newRank !== profile.rank };
    },
    [profile]
  );

  const updateTrophyProgress = useCallback(
    async (trophyId: string, newValue: number) => {
      const updated = trophies.map((t) => {
        if (t.id !== trophyId) return t;
        let starsEarned = 0;
        for (let i = 0; i < 5; i++) {
          if (newValue >= t.starThresholds[i]) starsEarned = i + 1;
        }
        const wasUnlocked = t.starsEarned > 0;
        return {
          ...t,
          currentValue: newValue,
          starsEarned,
          unlockedAt: !wasUnlocked && starsEarned > 0 ? new Date().toISOString() : t.unlockedAt,
        };
      });
      setTrophies(updated);
      await AsyncStorage.setItem(HUNTER_TROPHIES_KEY, JSON.stringify(updated));

      const trophy = updated.find((t) => t.id === trophyId);
      const old = trophies.find((t) => t.id === trophyId);
      return trophy && old ? { newStars: trophy.starsEarned - old.starsEarned } : { newStars: 0 };
    },
    [trophies]
  );

  const incrementTrophyProgress = useCallback(
    async (trophyId: string, increment: number) => {
      const trophy = trophies.find((t) => t.id === trophyId);
      if (!trophy) return { newStars: 0 };
      return updateTrophyProgress(trophyId, trophy.currentValue + increment);
    },
    [trophies, updateTrophyProgress]
  );

  return {
    profile,
    trophies,
    loading,
    activateHunterMode,
    deactivateHunterMode,
    resetHunterMode,
    addXP,
    updateTrophyProgress,
    incrementTrophyProgress,
    reload: load,
  };
}
