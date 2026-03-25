// ─── Hunter Mode Types (Solo Leveling Inspired) ──────────────────────────────

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'National';

export type QuestCategory = 'health' | 'exercise' | 'workout' | 'nutrition' | 'custom';
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'elite' | 'legendary';
export type QuestStatus = 'active' | 'completed' | 'failed' | 'expired';
export type QuestPeriod = 'daily' | 'weekly' | 'one_time';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  period: QuestPeriod;
  xpReward: number;
  statReward: Partial<HunterStats>;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: QuestStatus;
  isCustom: boolean;
  isPreset: boolean;
  icon: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  notificationId?: string;
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  /** Stars earned so far (0–5) */
  starsEarned: number;
  /** Required value for each star [★, ★★, ★★★, ★★★★, ★★★★★] */
  starThresholds: [number, number, number, number, number];
  currentValue: number;
  unlockedAt?: string; // when first star was earned
}

export interface HunterStats {
  strength: number;     // STR — from strength/workout quests
  agility: number;      // AGI — from cardio/steps quests
  vitality: number;     // VIT — from consistency/sleep quests
  intelligence: number; // INT — from food logging quests
  sense: number;        // SEN — from multi-category quests
}

export interface HunterProfile {
  isActive: boolean;
  rank: HunterRank;
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  title: string;
  stats: HunterStats;
  activatedAt?: string;
  questsCompleted: number;
  longestStreak: number;
  currentStreak: number;
}

// ─── Preset quest template (used to seed daily quests) ───────────────────────
export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  period: QuestPeriod;
  xpReward: number;
  statReward: Partial<HunterStats>;
  targetValue: number;
  unit: string;
  icon: string;
}
