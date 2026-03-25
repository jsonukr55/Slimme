import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { ProgressBar } from '@/components/ui/progress-bar';
import { DateSelector } from '@/components/ui/date-selector';
import { useFoodLog } from '@/hooks/use-food-log';
import { useExerciseLog } from '@/hooks/use-exercise-log';
import { useGoals } from '@/hooks/use-goals';
import { useWeightLog } from '@/hooks/use-weight-log';
import { useHealthCache } from '@/hooks/use-health-cache';
import { getDateKey } from '@/lib/date-utils';

export default function DashboardScreen() {
  const [date, setDate] = useState(getDateKey());
  const { entries, getDailyTotals, refresh: refreshFood } = useFoodLog(date);
  const { workouts, getTotalCaloriesBurned, refresh: refreshExercise } = useExerciseLog(date);
  const { goals } = useGoals();
  const { getLatestWeight } = useWeightLog();
  const { cache: healthCache } = useHealthCache();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshFood();
      refreshExercise();
    }, [date])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshFood(), refreshExercise()]);
    setRefreshing(false);
  };

  const totals = getDailyTotals();
  const workoutCalories = getTotalCaloriesBurned();
  const healthCalories = healthCache?.data?.activeCaloriesBurned || 0;
  const steps = healthCache?.data?.steps || 0;
  const burned = workoutCalories + healthCalories;
  const remaining = goals.dailyCalories - totals.calories + burned;
  const calorieProgress = goals.dailyCalories > 0 ? totals.calories / goals.dailyCalories : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <DateSelector date={date} onDateChange={setDate} />

      {/* Calorie Summary */}
      <Card style={styles.calorieCard}>
        <View style={styles.calorieRow}>
          <View style={styles.calorieInfo}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieStatValue}>{Math.round(totals.calories)}</Text>
              <Text style={styles.calorieStatLabel}>Eaten</Text>
            </View>
            <View style={styles.calorieStat}>
              <Text style={[styles.calorieStatValue, { color: Colors.accent }]}>{burned}</Text>
              <Text style={styles.calorieStatLabel}>Burned</Text>
            </View>
          </View>
          <ProgressRing
            size={140}
            strokeWidth={12}
            progress={calorieProgress}
            color={Colors.primary}
            centerValue={Math.round(remaining)}
            centerSubLabel="remaining"
          />
          <View style={styles.calorieInfo}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieStatValue}>{goals.dailyCalories}</Text>
              <Text style={styles.calorieStatLabel}>Goal</Text>
            </View>
            <View style={styles.calorieStat}>
              <Text style={[styles.calorieStatValue, { color: remaining < 0 ? Colors.error : Colors.success }]}>
                {Math.round(remaining)}
              </Text>
              <Text style={styles.calorieStatLabel}>Left</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Macros */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Macros</Text>
        <ProgressBar value={totals.protein} max={goals.dailyProtein} color={Colors.protein} label="Protein" />
        <ProgressBar value={totals.carbs} max={goals.dailyCarbs} color={Colors.carbs} label="Carbs" />
        <ProgressBar value={totals.fat} max={goals.dailyFat} color={Colors.fat} label="Fat" />
        <ProgressBar value={totals.fiber} max={goals.dailyFiber} color={Colors.fiber} label="Fiber" />
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/food/add')}>
          <Ionicons name="restaurant" size={24} color={Colors.primary} />
          <Text style={styles.quickActionText}>Log Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/exercise/add')}>
          <Ionicons name="barbell" size={24} color={Colors.accent} />
          <Text style={styles.quickActionText}>Log Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/weight/add')}>
          <Ionicons name="scale" size={24} color={Colors.protein} />
          <Text style={styles.quickActionText}>Log Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/food/ai-analyze')}>
          <Ionicons name="sparkles" size={24} color={Colors.fiber} />
          <Text style={styles.quickActionText}>AI Analyze</Text>
        </TouchableOpacity>
      </View>

      {/* Samsung Health Sync Banner */}
      <TouchableOpacity style={styles.syncBanner} onPress={() => router.push('/health-sync')}>
        <Ionicons name="watch-outline" size={20} color={Colors.primary} />
        <Text style={styles.syncBannerText}>Sync Samsung Watch data</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
      </TouchableOpacity>

      {/* Today's Summary */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="footsteps-outline" size={20} color={Colors.success} />
            <Text style={styles.summaryValue}>{steps > 0 ? steps.toLocaleString() : '--'}</Text>
            <Text style={styles.summaryLabel}>Steps</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="barbell-outline" size={20} color={Colors.accent} />
            <Text style={styles.summaryValue}>{workouts.length}</Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="scale-outline" size={20} color={Colors.protein} />
            <Text style={styles.summaryValue}>{getLatestWeight() ? `${getLatestWeight()}` : '--'}</Text>
            <Text style={styles.summaryLabel}>Weight (kg)</Text>
          </View>
        </View>
      </Card>

      {/* Recent Meals */}
      {entries.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          {entries.slice(-4).reverse().map((entry) => (
            <View key={entry.id} style={styles.recentItem}>
              <View>
                <Text style={styles.recentName}>{entry.foodItem.name}</Text>
                <Text style={styles.recentMeal}>{entry.mealType} - {entry.quantity} serving</Text>
              </View>
              <Text style={styles.recentCal}>{Math.round(entry.foodItem.nutrients.calories * entry.quantity)} cal</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Recent Workouts */}
      {workouts.length > 0 && (
        <Card style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Today's Workouts</Text>
          {workouts.map((w) => (
            <View key={w.id} style={styles.recentItem}>
              <View>
                <Text style={styles.recentName}>{w.name}</Text>
                <Text style={styles.recentMeal}>{w.exercises.length} exercises - {w.durationMinutes} min</Text>
              </View>
              <Text style={[styles.recentCal, { color: Colors.accent }]}>{w.caloriesBurned} cal</Text>
            </View>
          ))}
        </Card>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calorieCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calorieInfo: {
    alignItems: 'center',
    gap: 16,
  },
  calorieStat: {
    alignItems: 'center',
  },
  calorieStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  calorieStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  lastSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  syncBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  recentMeal: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentCal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
