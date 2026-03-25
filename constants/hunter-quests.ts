import { QuestTemplate } from '@/types/hunter';

// ─── Preset Quest Templates ───────────────────────────────────────────────────
// These are seeded as daily quests. A random selection is picked each day.

export const DAILY_QUEST_TEMPLATES: QuestTemplate[] = [
  // ── Health ────────────────────────────────────────────────────────────────
  {
    id: 'q_steps_10k',
    title: 'March of the Hunter',
    description: 'Walk 10,000 steps today. The System demands movement.',
    category: 'health',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 150,
    statReward: { agility: 2 },
    targetValue: 10000,
    unit: 'steps',
    icon: 'footsteps-outline',
  },
  {
    id: 'q_steps_5k',
    title: 'First Steps',
    description: 'Walk 5,000 steps. Every journey begins with a single step.',
    category: 'health',
    difficulty: 'easy',
    period: 'daily',
    xpReward: 80,
    statReward: { agility: 1 },
    targetValue: 5000,
    unit: 'steps',
    icon: 'footsteps-outline',
  },
  {
    id: 'q_water_8',
    title: 'Hydration Protocol',
    description: 'Drink 8 glasses of water. Stay hydrated, Hunter.',
    category: 'health',
    difficulty: 'easy',
    period: 'daily',
    xpReward: 60,
    statReward: { vitality: 1 },
    targetValue: 8,
    unit: 'glasses',
    icon: 'water-outline',
  },
  {
    id: 'q_sleep_8',
    title: 'Rest & Recovery',
    description: 'Sleep for 8 hours. Even the Shadow Monarch rests.',
    category: 'health',
    difficulty: 'easy',
    period: 'daily',
    xpReward: 70,
    statReward: { vitality: 2, sense: 1 },
    targetValue: 8,
    unit: 'hours',
    icon: 'moon-outline',
  },
  // ── Nutrition ─────────────────────────────────────────────────────────────
  {
    id: 'q_log_meals',
    title: 'Daily Rations',
    description: 'Log all 3 meals today. Know what fuels your power.',
    category: 'nutrition',
    difficulty: 'easy',
    period: 'daily',
    xpReward: 80,
    statReward: { intelligence: 2 },
    targetValue: 3,
    unit: 'meals',
    icon: 'restaurant-outline',
  },
  {
    id: 'q_protein_goal',
    title: 'Protein Absorption',
    description: 'Hit your daily protein goal. Rebuild and grow stronger.',
    category: 'nutrition',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 100,
    statReward: { strength: 1, intelligence: 1 },
    targetValue: 100,
    unit: '%',
    icon: 'barbell-outline',
  },
  {
    id: 'q_calorie_limit',
    title: 'Caloric Discipline',
    description: 'Stay within your calorie budget. Discipline is power.',
    category: 'nutrition',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 100,
    statReward: { intelligence: 2, vitality: 1 },
    targetValue: 1,
    unit: 'day',
    icon: 'flame-outline',
  },
  // ── Exercise ──────────────────────────────────────────────────────────────
  {
    id: 'q_workout',
    title: 'Hunter\'s Training',
    description: 'Complete a workout session. Sharpen your body like a blade.',
    category: 'exercise',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 120,
    statReward: { strength: 2, vitality: 1 },
    targetValue: 1,
    unit: 'session',
    icon: 'fitness-outline',
  },
  {
    id: 'q_cardio_30',
    title: 'Endurance Trial',
    description: 'Complete 30 minutes of cardio. Build your stamina.',
    category: 'exercise',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 110,
    statReward: { agility: 2, vitality: 1 },
    targetValue: 30,
    unit: 'minutes',
    icon: 'bicycle-outline',
  },
  {
    id: 'q_burn_300',
    title: 'Calorie Purge',
    description: 'Burn 300 calories through exercise. Leave nothing behind.',
    category: 'exercise',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 130,
    statReward: { agility: 1, strength: 1, vitality: 1 },
    targetValue: 300,
    unit: 'kcal',
    icon: 'flame-outline',
  },
  // ── Workout ───────────────────────────────────────────────────────────────
  {
    id: 'q_pushups_50',
    title: '50-Rep Discipline',
    description: 'Complete 50 push-ups. The basics forge the foundation.',
    category: 'workout',
    difficulty: 'normal',
    period: 'daily',
    xpReward: 90,
    statReward: { strength: 3 },
    targetValue: 50,
    unit: 'reps',
    icon: 'body-outline',
  },
  {
    id: 'q_pushups_100',
    title: 'Centurion Protocol',
    description: '100 push-ups. No shortcuts. No excuses.',
    category: 'workout',
    difficulty: 'hard',
    period: 'daily',
    xpReward: 180,
    statReward: { strength: 4 },
    targetValue: 100,
    unit: 'reps',
    icon: 'body-outline',
  },
  {
    id: 'q_stretch_10',
    title: 'Flexibility Training',
    description: 'Stretch for 10 minutes. A flexible body is a resilient one.',
    category: 'workout',
    difficulty: 'easy',
    period: 'daily',
    xpReward: 50,
    statReward: { agility: 1, sense: 1 },
    targetValue: 10,
    unit: 'minutes',
    icon: 'body-outline',
  },
];

export const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'wq_workouts_3',
    title: 'Weekly Warrior',
    description: 'Complete 3 workouts this week. Consistency is the key.',
    category: 'exercise',
    difficulty: 'normal',
    period: 'weekly',
    xpReward: 300,
    statReward: { strength: 3, vitality: 2 },
    targetValue: 3,
    unit: 'workouts',
    icon: 'trophy-outline',
  },
  {
    id: 'wq_steps_50k',
    title: 'Shadow March',
    description: 'Walk 50,000 steps this week. Cover the distance.',
    category: 'health',
    difficulty: 'hard',
    period: 'weekly',
    xpReward: 400,
    statReward: { agility: 4, vitality: 2 },
    targetValue: 50000,
    unit: 'steps',
    icon: 'map-outline',
  },
  {
    id: 'wq_log_7days',
    title: 'Perfect Logbook',
    description: 'Log meals every day this week. Knowledge is power.',
    category: 'nutrition',
    difficulty: 'hard',
    period: 'weekly',
    xpReward: 350,
    statReward: { intelligence: 5 },
    targetValue: 7,
    unit: 'days',
    icon: 'book-outline',
  },
];

// ─── XP thresholds per rank ───────────────────────────────────────────────────
export const RANK_XP_THRESHOLDS = {
  E: 0,
  D: 500,
  C: 2000,
  B: 5000,
  A: 10000,
  S: 25000,
  National: 60000,
};

export const RANK_TITLES: Record<string, string> = {
  E: 'Weak Hunter',
  D: 'Iron Hunter',
  C: 'Bronze Hunter',
  B: 'Silver Hunter',
  A: 'Gold Hunter',
  S: 'Shadow Monarch',
  National: 'The Absolute',
};

export const RANK_COLORS: Record<string, string> = {
  E: '#9CA3AF',   // gray
  D: '#78716C',   // stone
  C: '#CD7F32',   // bronze
  B: '#C0C0C0',   // silver
  A: '#FFD700',   // gold
  S: '#7C3AED',   // purple
  National: '#DC2626', // red
};

// XP needed to reach next level within a rank (10 levels per rank)
export const XP_PER_LEVEL = 50;
export const LEVELS_PER_RANK = 10;

// How many daily quests to show per day
export const DAILY_QUEST_COUNT = 5;
