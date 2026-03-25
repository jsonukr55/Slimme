export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: 'streak' | 'total' | 'milestone';
  category: 'food' | 'exercise' | 'weight' | 'general';
  threshold: number;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
}
