import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/use-goals';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useWeightLog } from '@/hooks/use-weight-log';
import { calculateBMR, calculateTDEE } from '@/lib/calculations';

export default function EditGoalsScreen() {
  const { goals, updateGoals } = useGoals();
  const { profile } = useUserProfile();
  const { getLatestWeight } = useWeightLog();

  const [targetWeight, setTargetWeight] = useState(goals.targetWeight?.toString() || '');
  const [dailyCalories, setDailyCalories] = useState(goals.dailyCalories.toString());
  const [dailyProtein, setDailyProtein] = useState(goals.dailyProtein.toString());
  const [dailyCarbs, setDailyCarbs] = useState(goals.dailyCarbs.toString());
  const [dailyFat, setDailyFat] = useState(goals.dailyFat.toString());
  const [dailyFiber, setDailyFiber] = useState(goals.dailyFiber.toString());
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(goals.weeklyWorkouts.toString());
  const [weeklyCardio, setWeeklyCardio] = useState(goals.weeklyCardioMinutes.toString());
  const [saving, setSaving] = useState(false);

  const latestWeight = getLatestWeight();
  const tdee = profile && latestWeight
    ? calculateTDEE(calculateBMR(latestWeight, profile.heightCm, profile.age, profile.sex), profile.activityLevel)
    : null;

  const applyTDEE = () => {
    if (tdee) {
      setDailyCalories(tdee.toString());
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGoals({
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        dailyCalories: parseFloat(dailyCalories) || 2000,
        dailyProtein: parseFloat(dailyProtein) || 120,
        dailyCarbs: parseFloat(dailyCarbs) || 250,
        dailyFat: parseFloat(dailyFat) || 65,
        dailyFiber: parseFloat(dailyFiber) || 25,
        weeklyWorkouts: parseInt(weeklyWorkouts) || 4,
        weeklyCardioMinutes: parseInt(weeklyCardio) || 150,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* TDEE Suggestion */}
      {tdee && (
        <Card style={styles.tdeeCard}>
          <View style={styles.tdeeRow}>
            <Ionicons name="flash-outline" size={20} color={Colors.accent} />
            <View style={styles.tdeeInfo}>
              <Text style={styles.tdeeTitle}>Suggested Daily Calories</Text>
              <Text style={styles.tdeeValue}>{tdee} kcal (based on your profile TDEE)</Text>
            </View>
            <Button title="Use" onPress={applyTDEE} size="sm" variant="outline" />
          </View>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Weight Goal</Text>
        <Input label="Target Weight" value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" placeholder="e.g. 70" suffix="kg" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Daily Nutrition Goals</Text>
        <Input label="Daily Calories" value={dailyCalories} onChangeText={setDailyCalories} keyboardType="numeric" suffix="kcal" />
        <Input label="Daily Protein" value={dailyProtein} onChangeText={setDailyProtein} keyboardType="decimal-pad" suffix="g" />
        <Input label="Daily Carbohydrates" value={dailyCarbs} onChangeText={setDailyCarbs} keyboardType="decimal-pad" suffix="g" />
        <Input label="Daily Fat" value={dailyFat} onChangeText={setDailyFat} keyboardType="decimal-pad" suffix="g" />
        <Input label="Daily Fiber" value={dailyFiber} onChangeText={setDailyFiber} keyboardType="decimal-pad" suffix="g" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Exercise Goals</Text>
        <Input label="Workouts per Week" value={weeklyWorkouts} onChangeText={setWeeklyWorkouts} keyboardType="numeric" suffix="days" />
        <Input label="Cardio per Week" value={weeklyCardio} onChangeText={setWeeklyCardio} keyboardType="numeric" suffix="min" />
      </Card>

      <View style={styles.saveBtn}>
        <Button title="Save Goals" onPress={handleSave} size="lg" loading={saving} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tdeeCard: { margin: Spacing.md, marginBottom: 0 },
  tdeeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tdeeInfo: { flex: 1 },
  tdeeTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  tdeeValue: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  card: { margin: Spacing.md, marginBottom: 0, marginTop: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  saveBtn: { margin: Spacing.md, marginTop: Spacing.lg },
});
