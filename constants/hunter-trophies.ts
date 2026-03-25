import { Trophy } from '@/types/hunter';

// ─── Trophy Definitions ───────────────────────────────────────────────────────
// Each trophy has 5 stars with increasing thresholds (Solo Leveling style).

export const TROPHY_DEFINITIONS: Omit<Trophy, 'starsEarned' | 'currentValue' | 'unlockedAt'>[] = [
  // ── Quest Completion ──────────────────────────────────────────────────────
  {
    id: 'trophy_iron_will',
    title: 'Iron Will',
    description: 'Complete daily quests.',
    category: 'quests',
    icon: 'shield-outline',
    starThresholds: [5, 15, 30, 60, 100],
  },
  {
    id: 'trophy_arise',
    title: 'Arise',
    description: 'Reach quest completion milestones.',
    category: 'quests',
    icon: 'star-outline',
    starThresholds: [10, 50, 100, 250, 500],
  },
  // ── Steps ─────────────────────────────────────────────────────────────────
  {
    id: 'trophy_step_master',
    title: 'Step Master',
    description: 'Total steps walked lifetime.',
    category: 'health',
    icon: 'footsteps-outline',
    starThresholds: [50000, 100000, 500000, 1000000, 10000000],
  },
  {
    id: 'trophy_daily_march',
    title: 'Daily March',
    description: 'Days where you hit 10,000 steps.',
    category: 'health',
    icon: 'walk-outline',
    starThresholds: [3, 7, 21, 50, 100],
  },
  // ── Calories ─────────────────────────────────────────────────────────────
  {
    id: 'trophy_calorie_slayer',
    title: 'Calorie Slayer',
    description: 'Total calories burned through exercise.',
    category: 'exercise',
    icon: 'flame-outline',
    starThresholds: [5000, 10000, 50000, 100000, 500000],
  },
  {
    id: 'trophy_calorie_counter',
    title: 'Calorie Counter',
    description: 'Days you stayed within your calorie goal.',
    category: 'nutrition',
    icon: 'calculator-outline',
    starThresholds: [3, 7, 21, 50, 100],
  },
  // ── Workouts ──────────────────────────────────────────────────────────────
  {
    id: 'trophy_muscle_builder',
    title: 'Muscle Builder',
    description: 'Strength workouts completed.',
    category: 'workout',
    icon: 'barbell-outline',
    starThresholds: [10, 25, 50, 100, 200],
  },
  {
    id: 'trophy_road_runner',
    title: 'Road Runner',
    description: 'Cardio sessions completed.',
    category: 'exercise',
    icon: 'bicycle-outline',
    starThresholds: [5, 15, 30, 60, 100],
  },
  {
    id: 'trophy_iron_body',
    title: 'Iron Body',
    description: 'Total workout minutes.',
    category: 'workout',
    icon: 'body-outline',
    starThresholds: [300, 1000, 3000, 6000, 12000],
  },
  // ── Nutrition ─────────────────────────────────────────────────────────────
  {
    id: 'trophy_food_tracker',
    title: 'Food Tracker',
    description: 'Total meals logged.',
    category: 'nutrition',
    icon: 'restaurant-outline',
    starThresholds: [50, 100, 250, 500, 1000],
  },
  {
    id: 'trophy_protein_king',
    title: 'Protein King',
    description: 'Days you hit your protein goal.',
    category: 'nutrition',
    icon: 'nutrition-outline',
    starThresholds: [5, 15, 30, 60, 100],
  },
  // ── Consistency ───────────────────────────────────────────────────────────
  {
    id: 'trophy_streak_hunter',
    title: 'Streak Hunter',
    description: 'Consecutive days active in the app.',
    category: 'consistency',
    icon: 'calendar-outline',
    starThresholds: [3, 7, 14, 30, 100],
  },
  {
    id: 'trophy_perfect_day',
    title: 'Perfect Day',
    description: 'Days you completed all active quests.',
    category: 'quests',
    icon: 'checkmark-circle-outline',
    starThresholds: [1, 5, 10, 25, 50],
  },
  // ── Hunter Mode ───────────────────────────────────────────────────────────
  {
    id: 'trophy_shadow_soldier',
    title: 'Shadow Soldier',
    description: 'Total XP earned in Hunter Mode.',
    category: 'hunter',
    icon: 'skull-outline',
    starThresholds: [500, 2000, 5000, 10000, 25000],
  },
  {
    id: 'trophy_dungeon_clear',
    title: 'Dungeon Clear',
    description: 'Weekly quests completed.',
    category: 'hunter',
    icon: 'trophy-outline',
    starThresholds: [1, 4, 10, 20, 52],
  },
];

export const TROPHY_STAR_COLORS = ['#CD7F32', '#C0C0C0', '#FFD700', '#7C3AED', '#DC2626'];
// ★ bronze, ★★ silver, ★★★ gold, ★★★★ purple, ★★★★★ red (S-rank)
