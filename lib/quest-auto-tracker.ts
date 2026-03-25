import AsyncStorage from '@react-native-async-storage/async-storage';
import { getForDate, getData } from '@/lib/storage';
import { Quest, HunterStats } from '@/types/hunter';

const QUESTS_KEY_PREFIX = 'hunter_quests_';
const WEEKLY_QUESTS_KEY = 'hunter_weekly_quests';
export const PENDING_XP_KEY = 'hunter_pending_xp';

export interface PendingXP {
  xpReward: number;
  statReward: Partial<HunterStats>;
  questTitle: string;
}

// Extract the template ID from a seeded quest ID (format: `templateId_timestamp_random`)
function extractTemplateId(questId: string): string {
  const parts = questId.split('_');
  for (let i = 1; i < parts.length; i++) {
    if (/^\d{10,}$/.test(parts[i])) {
      return parts.slice(0, i).join('_');
    }
  }
  return questId;
}

function localDateKey(date?: Date): string {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

async function appendPendingXP(items: PendingXP[]) {
  if (items.length === 0) return;
  const raw = await AsyncStorage.getItem(PENDING_XP_KEY);
  const current: PendingXP[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(PENDING_XP_KEY, JSON.stringify([...current, ...items]));
}

async function countWeeklyWorkouts(): Promise<number> {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const data = await getForDate<any[]>('workouts', localDateKey(d));
    total += (data || []).length;
  }
  return total;
}

async function countWeeklyFoodDays(): Promise<number> {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const data = await getForDate<any[]>('food_log', localDateKey(d));
    if (data && data.length > 0) count++;
  }
  return count;
}

function processQuestList(
  quests: Quest[],
  progressMap: Record<string, number>,
  pendingXP: PendingXP[]
): { updated: Quest[]; changed: boolean } {
  let changed = false;
  const updated = quests.map((q) => {
    if (q.status === 'completed' || !q.isPreset) return q;
    const templateId = extractTemplateId(q.id);
    if (!(templateId in progressMap)) return q;

    const newValue = progressMap[templateId];
    const wasComplete = q.currentValue >= q.targetValue;
    const nowComplete = newValue >= q.targetValue;

    if (nowComplete && !wasComplete) {
      pendingXP.push({ xpReward: q.xpReward, statReward: q.statReward, questTitle: q.title });
      changed = true;
      return { ...q, currentValue: newValue, status: 'completed' as const, completedAt: new Date().toISOString() };
    }
    if (newValue !== q.currentValue) {
      changed = true;
      return { ...q, currentValue: newValue };
    }
    return q;
  });
  return { updated, changed };
}

export async function autoTrackQuests(dateKey: string): Promise<void> {
  // Skip if hunter not active
  const profileRaw = await AsyncStorage.getItem('hunter_profile');
  if (!profileRaw) return;
  const hunterProfile = JSON.parse(profileRaw);
  if (!hunterProfile.isActive) return;

  // Load today's data from Firestore storage
  const [workoutsData, foodData, goalsData] = await Promise.all([
    getForDate<any[]>('workouts', dateKey),
    getForDate<any[]>('food_log', dateKey),
    getData<any>('goals'),
  ]);

  const workouts = workoutsData || [];
  const foodEntries = foodData || [];
  const goals = goalsData || { dailyCalories: 2000, dailyProtein: 120 };

  // Metrics for daily quests
  const totalCaloriesBurned = workouts.reduce((s: number, w: any) => s + (w.caloriesBurned || 0), 0);
  const mealTypes = new Set(foodEntries.map((e: any) => e.mealType));
  const totalCalories = foodEntries.reduce(
    (s: number, e: any) => s + (e.foodItem?.nutrients?.calories || 0) * (e.quantity || 1), 0
  );
  const totalProtein = foodEntries.reduce(
    (s: number, e: any) => s + (e.foodItem?.nutrients?.protein || 0) * (e.quantity || 1), 0
  );
  const proteinPercent = goals.dailyProtein > 0
    ? Math.round((totalProtein / goals.dailyProtein) * 100)
    : 0;

  // Cardio: check exercises within each workout
  let cardioMinutes = 0;
  for (const w of workouts) {
    const hasCardio = (w.exercises || []).some((e: any) => {
      // exercise might have a category or we check exerciseId prefix
      return e.exerciseId?.includes('cardio') || e.exerciseName?.toLowerCase().match(/run|cardio|cycling|jump|burpee/);
    });
    if (hasCardio) cardioMinutes += w.durationMinutes || 0;
  }

  const dailyProgressMap: Record<string, number> = {
    q_workout: workouts.length > 0 ? 1 : 0,
    q_cardio_30: cardioMinutes,
    q_burn_300: totalCaloriesBurned,
    q_log_meals: mealTypes.size,
    q_protein_goal: proteinPercent,
    q_calorie_limit: (totalCalories > 0 && totalCalories <= goals.dailyCalories) ? 1 : 0,
  };

  // --- Update daily quests ---
  const dailyKey = `${QUESTS_KEY_PREFIX}daily_${dateKey}`;
  const dailyRaw = await AsyncStorage.getItem(dailyKey);
  if (dailyRaw) {
    const pendingXP: PendingXP[] = [];
    const { updated, changed } = processQuestList(JSON.parse(dailyRaw), dailyProgressMap, pendingXP);
    if (changed) await AsyncStorage.setItem(dailyKey, JSON.stringify(updated));
    await appendPendingXP(pendingXP);
  }

  // --- Update weekly quests ---
  const weeklyKey = `${WEEKLY_QUESTS_KEY}_${getWeekKey()}`;
  const weeklyRaw = await AsyncStorage.getItem(weeklyKey);
  if (weeklyRaw) {
    const [weekWorkouts, weekFoodDays] = await Promise.all([
      countWeeklyWorkouts(),
      countWeeklyFoodDays(),
    ]);
    const weeklyProgressMap: Record<string, number> = {
      wq_workouts_3: weekWorkouts,
      wq_log_7days: weekFoodDays,
    };
    const pendingXP: PendingXP[] = [];
    const { updated, changed } = processQuestList(JSON.parse(weeklyRaw), weeklyProgressMap, pendingXP);
    if (changed) await AsyncStorage.setItem(weeklyKey, JSON.stringify(updated));
    await appendPendingXP(pendingXP);
  }
}

export async function consumePendingXP(): Promise<PendingXP[]> {
  const raw = await AsyncStorage.getItem(PENDING_XP_KEY);
  if (!raw) return [];
  await AsyncStorage.removeItem(PENDING_XP_KEY);
  return JSON.parse(raw);
}
