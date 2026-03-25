import { AchievementDefinition } from '@/types/achievement';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Food logging streaks
  { id: 'log_food_3', title: 'Getting Started', description: 'Log food for 3 days in a row', icon: 'leaf-outline', condition: 'streak', category: 'food', threshold: 3 },
  { id: 'log_food_7', title: 'Week Warrior', description: 'Log food for 7 days in a row', icon: 'flame-outline', condition: 'streak', category: 'food', threshold: 7 },
  { id: 'log_food_30', title: 'Monthly Master', description: 'Log food for 30 days in a row', icon: 'trophy-outline', condition: 'streak', category: 'food', threshold: 30 },

  // Workout milestones
  { id: 'workout_1', title: 'First Step', description: 'Complete your first workout', icon: 'barbell-outline', condition: 'total', category: 'exercise', threshold: 1 },
  { id: 'workout_10', title: 'Gym Rat', description: 'Complete 10 workouts', icon: 'fitness-outline', condition: 'total', category: 'exercise', threshold: 10 },
  { id: 'workout_50', title: 'Iron Will', description: 'Complete 50 workouts', icon: 'medal-outline', condition: 'total', category: 'exercise', threshold: 50 },
  { id: 'workout_100', title: 'Beast Mode', description: 'Complete 100 workouts', icon: 'flash-outline', condition: 'total', category: 'exercise', threshold: 100 },

  // Weight milestones
  { id: 'weight_log_1', title: 'Scale Starter', description: 'Log your first weight', icon: 'scale-outline', condition: 'total', category: 'weight', threshold: 1 },
  { id: 'weight_loss_2', title: 'First Drop', description: 'Lose 2 kg from starting weight', icon: 'trending-down-outline', condition: 'milestone', category: 'weight', threshold: 2 },
  { id: 'weight_loss_5', title: 'Halfway Hero', description: 'Lose 5 kg from starting weight', icon: 'star-outline', condition: 'milestone', category: 'weight', threshold: 5 },
  { id: 'weight_loss_10', title: 'Transformation', description: 'Lose 10 kg from starting weight', icon: 'ribbon-outline', condition: 'milestone', category: 'weight', threshold: 10 },

  // Nutrition goals
  { id: 'protein_goal_7', title: 'Protein Pro', description: 'Hit protein goal 7 days in a row', icon: 'egg-outline', condition: 'streak', category: 'food', threshold: 7 },
  { id: 'calorie_goal_7', title: 'Calorie Counter', description: 'Stay within calorie goal 7 days straight', icon: 'checkmark-circle-outline', condition: 'streak', category: 'food', threshold: 7 },

  // General
  { id: 'profile_setup', title: 'All Set Up', description: 'Complete your profile setup', icon: 'person-outline', condition: 'total', category: 'general', threshold: 1 },
  { id: 'goal_setter', title: 'Goal Setter', description: 'Set your first fitness goal', icon: 'flag-outline', condition: 'total', category: 'general', threshold: 1 },
];
