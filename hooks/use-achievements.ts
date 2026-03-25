import { useState, useEffect, useCallback } from 'react';
import { UnlockedAchievement } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { getData, setData } from '@/lib/storage';

const STORAGE_KEY = 'achievements';
const STATS_KEY = 'achievement_stats';

interface AchievementStats {
  totalWorkouts: number;
  totalWeightLogs: number;
  foodLogStreak: number;
  exerciseStreak: number;
  proteinGoalStreak: number;
  calorieGoalStreak: number;
  weightLost: number;
  profileSetup: boolean;
  goalsSet: boolean;
}

const DEFAULT_STATS: AchievementStats = {
  totalWorkouts: 0,
  totalWeightLogs: 0,
  foodLogStreak: 0,
  exerciseStreak: 0,
  proteinGoalStreak: 0,
  calorieGoalStreak: 0,
  weightLost: 0,
  profileSetup: false,
  goalsSet: false,
};

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getData<UnlockedAchievement[]>(STORAGE_KEY);
    const statsData = await getData<AchievementStats>(STATS_KEY);
    setUnlocked(data || []);
    setStats(statsData || DEFAULT_STATS);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isUnlocked = (achievementId: string) => {
    return unlocked.some((u) => u.achievementId === achievementId);
  };

  const checkAndUnlock = async (newStats: Partial<AchievementStats>) => {
    const updatedStats = { ...stats, ...newStats };
    await setData(STATS_KEY, updatedStats);
    setStats(updatedStats);

    const newUnlocks: UnlockedAchievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (isUnlocked(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'log_food_3':
        case 'log_food_7':
        case 'log_food_30':
          shouldUnlock = updatedStats.foodLogStreak >= achievement.threshold;
          break;
        case 'workout_1':
        case 'workout_10':
        case 'workout_50':
        case 'workout_100':
          shouldUnlock = updatedStats.totalWorkouts >= achievement.threshold;
          break;
        case 'weight_log_1':
          shouldUnlock = updatedStats.totalWeightLogs >= 1;
          break;
        case 'weight_loss_2':
        case 'weight_loss_5':
        case 'weight_loss_10':
          shouldUnlock = updatedStats.weightLost >= achievement.threshold;
          break;
        case 'protein_goal_7':
          shouldUnlock = updatedStats.proteinGoalStreak >= 7;
          break;
        case 'calorie_goal_7':
          shouldUnlock = updatedStats.calorieGoalStreak >= 7;
          break;
        case 'profile_setup':
          shouldUnlock = updatedStats.profileSetup;
          break;
        case 'goal_setter':
          shouldUnlock = updatedStats.goalsSet;
          break;
      }

      if (shouldUnlock) {
        newUnlocks.push({ achievementId: achievement.id, unlockedAt: Date.now() });
      }
    }

    if (newUnlocks.length > 0) {
      const updated = [...unlocked, ...newUnlocks];
      await setData(STORAGE_KEY, updated);
      setUnlocked(updated);
    }

    return newUnlocks;
  };

  return {
    unlocked,
    stats,
    loading,
    isUnlocked,
    checkAndUnlock,
    achievements: ACHIEVEMENTS,
    refresh: load,
  };
}
