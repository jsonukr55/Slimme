import { getData, setData, getForDate } from '@/lib/storage';
import { getDateKey } from '@/lib/date-utils';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { UnlockedAchievement } from '@/types/achievement';

const STATS_KEY = 'achievement_stats';
const UNLOCKED_KEY = 'achievements';

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
  totalWorkouts: 0, totalWeightLogs: 0, foodLogStreak: 0,
  exerciseStreak: 0, proteinGoalStreak: 0, calorieGoalStreak: 0,
  weightLost: 0, profileSetup: false, goalsSet: false,
};

async function checkAndSave(stats: AchievementStats): Promise<void> {
  await setData(STATS_KEY, stats);
  const unlocked = (await getData<UnlockedAchievement[]>(UNLOCKED_KEY)) || [];
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const newUnlocks: UnlockedAchievement[] = [];

  for (const a of ACHIEVEMENTS) {
    if (unlockedIds.has(a.id)) continue;
    let unlock = false;
    switch (a.id) {
      case 'log_food_3': case 'log_food_7': case 'log_food_30':
        unlock = stats.foodLogStreak >= a.threshold; break;
      case 'workout_1': case 'workout_10': case 'workout_50': case 'workout_100':
        unlock = stats.totalWorkouts >= a.threshold; break;
      case 'weight_log_1':
        unlock = stats.totalWeightLogs >= 1; break;
      case 'weight_loss_2': case 'weight_loss_5': case 'weight_loss_10':
        unlock = stats.weightLost >= a.threshold; break;
      case 'protein_goal_7':
        unlock = stats.proteinGoalStreak >= 7; break;
      case 'calorie_goal_7':
        unlock = stats.calorieGoalStreak >= 7; break;
      case 'profile_setup':
        unlock = stats.profileSetup; break;
      case 'goal_setter':
        unlock = stats.goalsSet; break;
    }
    if (unlock) newUnlocks.push({ achievementId: a.id, unlockedAt: Date.now() });
  }

  if (newUnlocks.length > 0) {
    await setData(UNLOCKED_KEY, [...unlocked, ...newUnlocks]);
  }
}

export async function trackWorkoutAdded(): Promise<void> {
  const stats = { ...(await getData<AchievementStats>(STATS_KEY) || DEFAULT_STATS) };
  stats.totalWorkouts += 1;
  await checkAndSave(stats);
}

export async function trackFoodLogged(dateKey: string): Promise<void> {
  const stats = { ...(await getData<AchievementStats>(STATS_KEY) || DEFAULT_STATS) };
  // Check if yesterday had food logged too
  const d = new Date(dateKey);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  const yesterdayKey = `${y}-${m}-${day}`;
  const yesterdayFood = await getForDate<any[]>('food_log', yesterdayKey);
  stats.foodLogStreak = (yesterdayFood && yesterdayFood.length > 0) ? stats.foodLogStreak + 1 : 1;
  await checkAndSave(stats);
}

export async function trackWeightLogged(history: { weight: number }[]): Promise<void> {
  const stats = { ...(await getData<AchievementStats>(STATS_KEY) || DEFAULT_STATS) };
  stats.totalWeightLogs = history.length;
  if (history.length >= 2) {
    const loss = history[0].weight - history[history.length - 1].weight;
    stats.weightLost = Math.max(0, loss);
  }
  await checkAndSave(stats);
}

export async function trackProfileSetup(): Promise<void> {
  const stats = { ...(await getData<AchievementStats>(STATS_KEY) || DEFAULT_STATS) };
  stats.profileSetup = true;
  await checkAndSave(stats);
}

export async function trackGoalSet(): Promise<void> {
  const stats = { ...(await getData<AchievementStats>(STATS_KEY) || DEFAULT_STATS) };
  stats.goalsSet = true;
  await checkAndSave(stats);
}
