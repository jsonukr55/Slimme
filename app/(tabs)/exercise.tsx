import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { DateSelector } from '@/components/ui/date-selector';
import { EmptyState } from '@/components/ui/empty-state';
import { useExerciseLog } from '@/hooks/use-exercise-log';
import { getDateKey } from '@/lib/date-utils';

interface ExerciseInfo {
  name: string;
  muscle: string;
  equipment: string;
  color: string;
}

const EXERCISE_LIBRARY: ExerciseInfo[] = [
  // Chest
  { name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', color: '#E74C3C' },
  { name: 'Push-ups', muscle: 'Chest', equipment: 'Bodyweight', color: '#E74C3C' },
  { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', equipment: 'Dumbbell', color: '#E74C3C' },
  { name: 'Cable Flyes', muscle: 'Chest', equipment: 'Cable', color: '#E74C3C' },
  { name: 'Dips', muscle: 'Chest/Triceps', equipment: 'Bodyweight', color: '#E74C3C' },
  // Back
  { name: 'Pull-ups', muscle: 'Back/Biceps', equipment: 'Bodyweight', color: '#2ECC71' },
  { name: 'Lat Pulldown', muscle: 'Lats', equipment: 'Cable', color: '#2ECC71' },
  { name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', color: '#2ECC71' },
  { name: 'Deadlift', muscle: 'Full Back', equipment: 'Barbell', color: '#2ECC71' },
  { name: 'Seated Cable Row', muscle: 'Mid Back', equipment: 'Cable', color: '#2ECC71' },
  { name: 'Face Pulls', muscle: 'Rear Delts', equipment: 'Cable', color: '#2ECC71' },
  // Shoulders
  { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', color: '#3498DB' },
  { name: 'Dumbbell Lateral Raise', muscle: 'Side Delts', equipment: 'Dumbbell', color: '#3498DB' },
  { name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell', color: '#3498DB' },
  { name: 'Rear Delt Fly', muscle: 'Rear Delts', equipment: 'Dumbbell', color: '#3498DB' },
  // Biceps
  { name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', color: '#9B59B6' },
  { name: 'Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell', color: '#9B59B6' },
  { name: 'Hammer Curl', muscle: 'Biceps/Brachialis', equipment: 'Dumbbell', color: '#9B59B6' },
  { name: 'Preacher Curl', muscle: 'Biceps', equipment: 'Barbell', color: '#9B59B6' },
  // Triceps
  { name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', color: '#E67E22' },
  { name: 'Skull Crushers', muscle: 'Triceps', equipment: 'Barbell', color: '#E67E22' },
  { name: 'Overhead Tricep Extension', muscle: 'Triceps', equipment: 'Dumbbell', color: '#E67E22' },
  // Legs
  { name: 'Squat', muscle: 'Quads/Glutes', equipment: 'Barbell', color: '#1ABC9C' },
  { name: 'Leg Press', muscle: 'Quads', equipment: 'Machine', color: '#1ABC9C' },
  { name: 'Lunges', muscle: 'Quads/Glutes', equipment: 'Bodyweight', color: '#1ABC9C' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', color: '#1ABC9C' },
  { name: 'Leg Curl', muscle: 'Hamstrings', equipment: 'Machine', color: '#1ABC9C' },
  { name: 'Leg Extension', muscle: 'Quads', equipment: 'Machine', color: '#1ABC9C' },
  { name: 'Calf Raises', muscle: 'Calves', equipment: 'Machine', color: '#1ABC9C' },
  { name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', color: '#1ABC9C' },
  // Core
  { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', color: '#F39C12' },
  { name: 'Crunches', muscle: 'Abs', equipment: 'Bodyweight', color: '#F39C12' },
  { name: 'Russian Twists', muscle: 'Obliques', equipment: 'Bodyweight', color: '#F39C12' },
  { name: 'Leg Raises', muscle: 'Lower Abs', equipment: 'Bodyweight', color: '#F39C12' },
  { name: 'Mountain Climbers', muscle: 'Core/Cardio', equipment: 'Bodyweight', color: '#F39C12' },
  // Cardio
  { name: 'Running', muscle: 'Full Body', equipment: 'Bodyweight', color: '#E91E63' },
  { name: 'Jump Rope', muscle: 'Full Body', equipment: 'Equipment', color: '#E91E63' },
  { name: 'Burpees', muscle: 'Full Body', equipment: 'Bodyweight', color: '#E91E63' },
  { name: 'Cycling', muscle: 'Legs/Cardio', equipment: 'Bike', color: '#E91E63' },
  { name: 'Jumping Jacks', muscle: 'Full Body', equipment: 'Bodyweight', color: '#E91E63' },
];

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio'];

export default function ExerciseScreen() {
  const [date, setDate] = useState(getDateKey());
  const { workouts, getTotalCaloriesBurned, getTotalDuration, removeWorkout, refresh } = useExerciseLog(date);
  const [activeTab, setActiveTab] = useState<'log' | 'library'>('log');
  const [muscleFilter, setMuscleFilter] = useState('All');

  useFocusEffect(useCallback(() => { refresh(); }, [date]));

  const filteredExercises = muscleFilter === 'All'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter((e) => e.muscle.toLowerCase().includes(muscleFilter.toLowerCase()) || e.name.toLowerCase().includes(muscleFilter.toLowerCase()));

  return (
    <View style={styles.container}>
      <DateSelector date={date} onDateChange={setDate} />

      {/* Tab toggle */}
      <View style={styles.tabToggle}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'log' && styles.tabBtnActive]}
          onPress={() => setActiveTab('log')}
        >
          <Ionicons name="list-outline" size={15} color={activeTab === 'log' ? '#FFF' : Colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'log' && styles.tabBtnTextActive]}>My Log</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'library' && styles.tabBtnActive]}
          onPress={() => setActiveTab('library')}
        >
          <Ionicons name="barbell-outline" size={15} color={activeTab === 'library' ? '#FFF' : Colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'library' && styles.tabBtnTextActive]}>Exercise Library</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'log' ? (
        <ScrollView style={styles.scrollView}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="flame-outline" size={24} color={Colors.accent} />
                <Text style={styles.summaryValue}>{getTotalCaloriesBurned()}</Text>
                <Text style={styles.summaryLabel}>Cal Burned</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="time-outline" size={24} color={Colors.primary} />
                <Text style={styles.summaryValue}>{getTotalDuration()}</Text>
                <Text style={styles.summaryLabel}>Minutes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="barbell-outline" size={24} color={Colors.protein} />
                <Text style={styles.summaryValue}>{workouts.length}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </View>
            </View>
          </Card>

          {workouts.length === 0 ? (
            <EmptyState icon="barbell-outline" title="No workouts today" subtitle="Tap + to log a workout" />
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.durationMinutes} min - {workout.caloriesBurned} cal burned
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/exercise/add', params: { date, editId: workout.id } })}
                      style={styles.editBtn}
                    >
                      <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeWorkout(workout.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {workout.exercises.map((exercise, idx) => (
                  <View key={idx} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    <View style={styles.setsContainer}>
                      {exercise.sets.map((set, setIdx) => (
                        <Text key={setIdx} style={styles.setText}>
                          {set.weight ? `${set.weight}kg x ${set.reps}` : set.duration ? `${set.duration}s` : `${set.reps} reps`}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}

                {workout.notes && <Text style={styles.notes}>{workout.notes}</Text>}
              </Card>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View style={styles.libraryContainer}>
          {/* Muscle group filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {MUSCLE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                style={[styles.filterChip, muscleFilter === group && styles.filterChipActive]}
                onPress={() => setMuscleFilter(group)}
              >
                <Text style={[styles.filterChipText, muscleFilter === group && styles.filterChipTextActive]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.name}
            numColumns={2}
            contentContainerStyle={styles.libraryGrid}
            columnWrapperStyle={styles.libraryRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.exerciseCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}
                onPress={() => router.push({ pathname: '/exercise/add', params: { date, preExercise: item.name } })}
                activeOpacity={0.8}
              >
                <View style={[styles.exerciseIconBg, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name="barbell" size={20} color={item.color} />
                </View>
                <Text style={styles.exerciseCardName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.exerciseMuscleRow}>
                  <Ionicons name="body-outline" size={11} color={Colors.textSecondary} />
                  <Text style={styles.exerciseMuscleText} numberOfLines={1}>{item.muscle}</Text>
                </View>
                <View style={[styles.equipmentBadge, { backgroundColor: item.color + '15' }]}>
                  <Text style={[styles.equipmentText, { color: item.color }]}>{item.equipment}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {activeTab === 'log' && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/exercise/add', params: { date } })}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  tabToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm - 2,
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabBtnTextActive: { color: '#FFF' },
  summaryCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary },
  workoutCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  workoutName: { fontSize: 17, fontWeight: '700', color: Colors.text },
  workoutMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 4 },
  editBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  exerciseItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  exerciseName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  setsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  setText: { fontSize: 12, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  notes: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', marginTop: Spacing.sm },
  // Library
  libraryContainer: { flex: 1 },
  filterScroll: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#FFF' },
  libraryGrid: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  libraryRow: { gap: Spacing.sm, marginBottom: Spacing.sm },
  exerciseCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exerciseCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    minHeight: 34,
  },
  exerciseMuscleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  exerciseMuscleText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  equipmentBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  equipmentText: { fontSize: 10, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
});
