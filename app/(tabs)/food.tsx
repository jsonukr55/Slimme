import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { DateSelector } from '@/components/ui/date-selector';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useFoodLog } from '@/hooks/use-food-log';
import { useGoals } from '@/hooks/use-goals';
import { getDateKey } from '@/lib/date-utils';
import { MealType } from '@/types/food';

const MEAL_TYPES: { type: MealType; icon: string; label: string }[] = [
  { type: 'breakfast', icon: 'sunny-outline', label: 'Breakfast' },
  { type: 'lunch', icon: 'restaurant-outline', label: 'Lunch' },
  { type: 'dinner', icon: 'moon-outline', label: 'Dinner' },
  { type: 'snack', icon: 'cafe-outline', label: 'Snack' },
];

export default function FoodScreen() {
  const [date, setDate] = useState(getDateKey());
  const { entries, getEntriesByMeal, getDailyTotals, getMealTotals, removeEntry, refresh } = useFoodLog(date);
  const { goals } = useGoals();

  useFocusEffect(useCallback(() => { refresh(); }, [date]));

  const totals = getDailyTotals();

  return (
    <View style={styles.container}>
      <DateSelector date={date} onDateChange={setDate} />

      <ScrollView style={styles.scrollView}>
        {/* Daily Totals */}
        <Card style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.calories }]}>{Math.round(totals.calories)}</Text>
              <Text style={styles.totalLabel}>Calories</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.protein }]}>{Math.round(totals.protein)}g</Text>
              <Text style={styles.totalLabel}>Protein</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.carbs }]}>{Math.round(totals.carbs)}g</Text>
              <Text style={styles.totalLabel}>Carbs</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: Colors.fat }]}>{Math.round(totals.fat)}g</Text>
              <Text style={styles.totalLabel}>Fat</Text>
            </View>
          </View>
          <View style={{ marginTop: Spacing.sm }}>
            <ProgressBar value={totals.calories} max={goals.dailyCalories} color={Colors.calories} label="Calories" unit=" kcal" height={8} />
          </View>
        </Card>

        {/* Meal Sections */}
        {MEAL_TYPES.map(({ type, icon, label }) => {
          const mealEntries = getEntriesByMeal(type);
          const mealTotals = getMealTotals(type);

          return (
            <Card key={type} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <Ionicons name={icon as any} size={20} color={Colors.primary} />
                  <Text style={styles.mealTitle}>{label}</Text>
                  <Text style={styles.mealCalories}>{Math.round(mealTotals.calories)} cal</Text>
                </View>
              </View>

              {mealEntries.length === 0 ? (
                <Text style={styles.noEntries}>No entries yet</Text>
              ) : (
                mealEntries.map((entry) => (
                  <View key={entry.id} style={styles.foodEntry}>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{entry.foodItem.name}</Text>
                      <Text style={styles.foodServing}>
                        {entry.quantity} x {entry.foodItem.servingSize}{entry.foodItem.servingUnit}
                      </Text>
                    </View>
                    <View style={styles.foodNutrients}>
                      <Text style={styles.foodCal}>{Math.round(entry.foodItem.nutrients.calories * entry.quantity)} cal</Text>
                      <Text style={styles.foodMacro}>P:{Math.round(entry.foodItem.nutrients.protein * entry.quantity)}g</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeEntry(entry.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <TouchableOpacity
                style={styles.addMealBtn}
                onPress={() => router.push({ pathname: '/food/add', params: { mealType: type, date } })}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addMealText}>Add {label}</Text>
              </TouchableOpacity>
            </Card>
          );
        })}

        {entries.length === 0 && (
          <EmptyState icon="restaurant-outline" title="No food logged" subtitle="Tap + to start tracking your meals" />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/food/add', params: { date } })}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  totalsCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  totalLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  mealCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  mealHeader: { marginBottom: Spacing.sm },
  mealTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  mealCalories: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  noEntries: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic', paddingVertical: 4 },
  foodEntry: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  foodServing: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  foodNutrients: { alignItems: 'flex-end', marginRight: Spacing.sm },
  foodCal: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  foodMacro: { fontSize: 11, color: Colors.textSecondary },
  deleteBtn: { padding: 4 },
  addMealBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: Spacing.sm },
  addMealText: { fontSize: 14, fontWeight: '500', color: Colors.primary },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
});
