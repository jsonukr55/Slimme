import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { DateSelector } from '@/components/ui/date-selector';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useFoodLog } from '@/hooks/use-food-log';
import { useGoals } from '@/hooks/use-goals';
import { getDateKey } from '@/lib/date-utils';

interface NutrientRowProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
}

function NutrientRow({ label, value, goal, color, unit = 'g' }: NutrientRowProps) {
  const percent = goal > 0 ? (value / goal) * 100 : 0;

  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientInfo}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientPercent}>{Math.round(percent)}% of daily goal</Text>
      </View>
      <View style={styles.nutrientValues}>
        <Text style={[styles.nutrientValue, { color }]}>{Math.round(value)}</Text>
        <Text style={styles.nutrientGoal}>/ {goal}{unit}</Text>
      </View>
      <View style={styles.barContainer}>
        <ProgressBar value={value} max={goal} color={color} showValue={false} height={8} />
      </View>
    </View>
  );
}

export default function NutrientsScreen() {
  const [date, setDate] = useState(getDateKey());
  const { getDailyTotals, entries, refresh } = useFoodLog(date);
  const { goals } = useGoals();

  useFocusEffect(useCallback(() => { refresh(); }, [date]));

  const totals = getDailyTotals();

  // Estimate recommended values for micronutrients based on entries
  const totalSodium = totals.sodium || 0;
  const totalSugar = totals.sugar || 0;

  return (
    <ScrollView style={styles.container}>
      <DateSelector date={date} onDateChange={setDate} />

      {/* Calorie Summary */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Calories</Text>
        <View style={styles.calorieRow}>
          <View style={styles.calorieStat}>
            <Text style={[styles.calorieValue, { color: Colors.calories }]}>{Math.round(totals.calories)}</Text>
            <Text style={styles.calorieLabel}>Consumed</Text>
          </View>
          <View style={styles.calorieDivider} />
          <View style={styles.calorieStat}>
            <Text style={styles.calorieValue}>{goals.dailyCalories}</Text>
            <Text style={styles.calorieLabel}>Goal</Text>
          </View>
          <View style={styles.calorieDivider} />
          <View style={styles.calorieStat}>
            <Text style={[styles.calorieValue, {
              color: goals.dailyCalories - totals.calories >= 0 ? Colors.success : Colors.error
            }]}>
              {Math.abs(Math.round(goals.dailyCalories - totals.calories))}
            </Text>
            <Text style={styles.calorieLabel}>
              {goals.dailyCalories - totals.calories >= 0 ? 'Remaining' : 'Over'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Macronutrients */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>
        <NutrientRow label="Protein" value={totals.protein} goal={goals.dailyProtein} color={Colors.protein} />
        <NutrientRow label="Carbohydrates" value={totals.carbs} goal={goals.dailyCarbs} color={Colors.carbs} />
        <NutrientRow label="Fat" value={totals.fat} goal={goals.dailyFat} color={Colors.fat} />
        <NutrientRow label="Fiber" value={totals.fiber} goal={goals.dailyFiber} color={Colors.fiber} />
      </Card>

      {/* Other Nutrients */}
      {(totalSugar > 0 || totalSodium > 0) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Other Nutrients</Text>
          {totalSugar > 0 && (
            <NutrientRow label="Sugar" value={totalSugar} goal={50} color={Colors.warning} />
          )}
          {totalSodium > 0 && (
            <NutrientRow label="Sodium" value={totalSodium} goal={2300} color={Colors.accent} unit="mg" />
          )}
        </Card>
      )}

      {/* Per Meal Breakdown */}
      {entries.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>By Meal</Text>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => {
            const mealEntries = entries.filter((e) => e.mealType === meal);
            if (mealEntries.length === 0) return null;
            const mealCal = mealEntries.reduce((s, e) => s + e.foodItem.nutrients.calories * e.quantity, 0);
            const mealPro = mealEntries.reduce((s, e) => s + e.foodItem.nutrients.protein * e.quantity, 0);
            const mealCarbs = mealEntries.reduce((s, e) => s + e.foodItem.nutrients.carbs * e.quantity, 0);
            const mealFat = mealEntries.reduce((s, e) => s + e.foodItem.nutrients.fat * e.quantity, 0);

            return (
              <View key={meal} style={styles.mealBreakdown}>
                <Text style={styles.mealName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                <View style={styles.mealMacros}>
                  <Text style={styles.mealCal}>{Math.round(mealCal)} cal</Text>
                  <Text style={[styles.mealMacro, { color: Colors.protein }]}>P:{Math.round(mealPro)}g</Text>
                  <Text style={[styles.mealMacro, { color: Colors.carbs }]}>C:{Math.round(mealCarbs)}g</Text>
                  <Text style={[styles.mealMacro, { color: Colors.fat }]}>F:{Math.round(mealFat)}g</Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  calorieStat: { alignItems: 'center' },
  calorieValue: { fontSize: 24, fontWeight: '700', color: Colors.text },
  calorieLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  calorieDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  nutrientRow: { marginBottom: Spacing.md },
  nutrientInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nutrientLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  nutrientPercent: { fontSize: 12, color: Colors.textSecondary },
  nutrientValues: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 4 },
  nutrientValue: { fontSize: 20, fontWeight: '700' },
  nutrientGoal: { fontSize: 13, color: Colors.textSecondary },
  barContainer: {},
  mealBreakdown: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  mealName: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  mealMacros: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  mealCal: { fontSize: 14, fontWeight: '700', color: Colors.calories },
  mealMacro: { fontSize: 12, fontWeight: '500' },
});
