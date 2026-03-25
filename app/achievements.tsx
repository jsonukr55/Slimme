import React from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { useAchievements } from '@/hooks/use-achievements';
import { AchievementDefinition } from '@/types/achievement';

const CATEGORY_COLORS: Record<string, string> = {
  food: Colors.primary,
  exercise: Colors.accent,
  weight: Colors.protein,
  general: Colors.fiber,
};

export default function AchievementsScreen() {
  const { achievements, isUnlocked, unlocked, stats } = useAchievements();

  const categories = ['general', 'food', 'exercise', 'weight'];

  const getProgressForAchievement = (achievement: AchievementDefinition): number => {
    switch (achievement.id) {
      case 'log_food_3':
      case 'log_food_7':
      case 'log_food_30':
        return Math.min(stats.foodLogStreak / achievement.threshold, 1);
      case 'workout_1':
      case 'workout_10':
      case 'workout_50':
      case 'workout_100':
        return Math.min(stats.totalWorkouts / achievement.threshold, 1);
      case 'weight_log_1':
        return Math.min(stats.totalWeightLogs / 1, 1);
      case 'weight_loss_2':
      case 'weight_loss_5':
      case 'weight_loss_10':
        return Math.min(stats.weightLost / achievement.threshold, 1);
      case 'protein_goal_7':
        return Math.min(stats.proteinGoalStreak / 7, 1);
      case 'calorie_goal_7':
        return Math.min(stats.calorieGoalStreak / 7, 1);
      default:
        return isUnlocked(achievement.id) ? 1 : 0;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{unlocked.length}</Text>
            <Text style={styles.summaryLabel}>Unlocked</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.textSecondary }]}>{achievements.length - unlocked.length}</Text>
            <Text style={styles.summaryLabel}>Remaining</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{achievements.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </Card>

      {categories.map((category) => {
        const catAchievements = achievements.filter((a) => a.category === category);
        const catColor = CATEGORY_COLORS[category];

        return (
          <View key={category}>
            <Text style={styles.categoryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <View style={styles.grid}>
              {catAchievements.map((achievement) => {
                const unlocked = isUnlocked(achievement.id);
                const progress = getProgressForAchievement(achievement);

                return (
                  <Card key={achievement.id} style={[styles.achievementCard, ...(unlocked ? [] : [styles.lockedCard])]}>
                    <View style={[styles.iconContainer, { backgroundColor: unlocked ? catColor + '20' : Colors.border + '40' }]}>
                      <Ionicons
                        name={achievement.icon as any}
                        size={28}
                        color={unlocked ? catColor : Colors.textLight}
                      />
                    </View>
                    <Text style={[styles.achievementTitle, ...(unlocked ? [] : [styles.lockedText])]} numberOfLines={1}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDesc} numberOfLines={2}>
                      {achievement.description}
                    </Text>
                    {!unlocked && progress > 0 && (
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: catColor }]} />
                      </View>
                    )}
                    {unlocked && (
                      <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={catColor} />
                        <Text style={[styles.unlockedText, { color: catColor }]}>Unlocked</Text>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summaryCard: { margin: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: '700', color: Colors.text },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Spacing.sm, gap: 8, marginBottom: Spacing.md },
  achievementCard: { width: '47%', alignItems: 'center', padding: Spacing.md },
  lockedCard: { opacity: 0.6 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  achievementTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  lockedText: { color: Colors.textSecondary },
  achievementDesc: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  progressBar: { width: '100%', height: 4, backgroundColor: Colors.border, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  unlockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  unlockedText: { fontSize: 11, fontWeight: '600' },
});
