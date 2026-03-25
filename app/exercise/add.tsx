import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExerciseLog } from '@/hooks/use-exercise-log';
import { useUserProfile } from '@/hooks/use-user-profile';
import { EXERCISE_DATABASE } from '@/constants/exercise-database';
import { WorkoutExercise, ExerciseSet, ExerciseDefinition } from '@/types/exercise';
import { calculateCaloriesBurned } from '@/lib/calculations';
import { getDateKey } from '@/lib/date-utils';

export default function AddExerciseScreen() {
  const params = useLocalSearchParams();
  const date = (params.date as string) || getDateKey();
  const preExercise = params.preExercise as string | undefined;
  const editId = params.editId as string | undefined;
  const { workouts, loading: workoutsLoading, addWorkout, updateWorkout } = useExerciseLog(date);
  const { profile } = useUserProfile();

  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing workout when editing — wait for workouts to finish loading
  useEffect(() => {
    if (!editId || workoutsLoading) return;
    const existing = workouts.find((w) => w.id === editId);
    if (existing) {
      setWorkoutName(existing.name);
      setDuration(existing.durationMinutes.toString());
      setNotes(existing.notes || '');
      setExercises(existing.exercises);
    }
  }, [editId, workoutsLoading, workouts]);

  // Pre-fill when coming from exercise library
  useEffect(() => {
    if (!preExercise || editId) return;
    const def = EXERCISE_DATABASE.find(
      (e) => e.name.toLowerCase() === preExercise.toLowerCase()
    );
    if (def) {
      setWorkoutName(def.name);
      setExercises([{
        exerciseId: def.id,
        exerciseName: def.name,
        sets: [{ setNumber: 1, reps: 10, weight: def.category === 'cardio' ? undefined : 0 }],
      }]);
    } else {
      setWorkoutName(preExercise);
    }
  }, [preExercise, editId]);

  const userWeight = profile?.weight ?? 70;

  const filteredExercises = EXERCISE_DATABASE.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const addExercise = (def: ExerciseDefinition) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: def.id,
        exerciseName: def.name,
        sets: [{ setNumber: 1, reps: 10, weight: def.category === 'cardio' ? undefined : 0 }],
      },
    ]);
    setShowPicker(false);
    setSearch('');
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [
        ...ex.sets,
        { ...lastSet, setNumber: lastSet.setNumber + 1 },
      ];
      updated[exIdx] = ex;
      return updated;
    });
  };

  const removeExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof ExerciseSet, value: string) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: parseFloat(value) || 0 };
      ex.sets = sets;
      updated[exIdx] = ex;
      return updated;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      ex.sets = ex.sets.filter((_, i) => i !== setIdx);
      updated[exIdx] = ex;
      return updated;
    });
  };

  const estimatedCalories = (() => {
    const dur = parseFloat(duration) || 0;
    let total = 0;
    for (const ex of exercises) {
      const def = EXERCISE_DATABASE.find((d) => d.id === ex.exerciseId);
      if (def) {
        total += calculateCaloriesBurned(def.metValue, userWeight, dur / Math.max(exercises.length, 1));
      }
    }
    if (exercises.length === 0 && dur > 0) total = Math.round(5 * userWeight * (dur / 60));
    return Math.round(total);
  })();

  const handleSave = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Name Required', 'Give your workout a name');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: workoutName,
        exercises,
        durationMinutes: parseFloat(duration) || 30,
        caloriesBurned: estimatedCalories,
        notes,
      };
      if (editId) {
        await updateWorkout(editId, payload);
      } else {
        await addWorkout(payload);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Card style={styles.card}>
          <Input label="Workout Name *" value={workoutName} onChangeText={setWorkoutName} placeholder="e.g. Push Day, Morning Run..." />
          <Input label="Duration" value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="30" suffix="min" />
          {parseFloat(duration) > 0 && (
            <View style={styles.calPreview}>
              <Ionicons name="flame-outline" size={16} color={Colors.accent} />
              <Text style={styles.calPreviewText}>~{estimatedCalories} calories burned (estimated)</Text>
            </View>
          )}
          <Input label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="How did it go? Any PRs?" />
        </Card>

        {/* Exercises */}
        <View style={styles.exercisesHeader}>
          <Text style={styles.exercisesTitle}>Exercises ({exercises.length})</Text>
          <TouchableOpacity style={styles.addExBtn} onPress={() => setShowPicker(true)}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.addExText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Picker */}
        {showPicker && (
          <Card style={styles.card}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.textLight}
                autoFocus
              />
              <TouchableOpacity onPress={() => { setShowPicker(false); setSearch(''); }}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
              {['strength', 'cardio', 'flexibility', 'sports'].map((cat) => (
                <TouchableOpacity key={cat} style={styles.catChip} onPress={() => setSearch(cat)}>
                  <Text style={styles.catChipText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FlatList
              data={search ? filteredExercises : EXERCISE_DATABASE}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.exItem} onPress={() => addExercise(item)}>
                  <View>
                    <Text style={styles.exItemName}>{item.name}</Text>
                    <Text style={styles.exItemMeta}>{item.category} - {item.muscleGroups.join(', ')}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
              )}
            />
          </Card>
        )}

        {/* Exercise List */}
        {exercises.map((exercise, exIdx) => {
          const def = EXERCISE_DATABASE.find((d) => d.id === exercise.exerciseId);
          const isCardio = def?.category === 'cardio';

          return (
            <Card key={exIdx} style={styles.exCard}>
              <View style={styles.exHeader}>
                <Text style={styles.exName}>{exercise.exerciseName}</Text>
                <TouchableOpacity onPress={() => removeExercise(exIdx)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>

              {/* Set header */}
              {!isCardio && (
                <View style={styles.setHeaderRow}>
                  <Text style={styles.setHeaderNum}>Set</Text>
                  <Text style={styles.setHeaderLabel}>Weight (kg)</Text>
                  <Text style={styles.setHeaderLabel}>Reps</Text>
                  <View style={{ width: 20 }} />
                </View>
              )}

              {/* Sets */}
              {exercise.sets.map((set, setIdx) => (
                <View key={setIdx} style={styles.setRow}>
                  <Text style={styles.setNum}>{set.setNumber}</Text>
                  {isCardio ? (
                    <View style={styles.setInputs}>
                      <View style={styles.setField}>
                        <TextInput
                          style={styles.setInput}
                          value={set.duration?.toString() || ''}
                          onChangeText={(v) => updateSet(exIdx, setIdx, 'duration', v)}
                          keyboardType="numeric"
                          placeholder="60"
                          placeholderTextColor={Colors.textLight}
                        />
                        <Text style={styles.setUnit}>sec</Text>
                      </View>
                      <View style={styles.setField}>
                        <TextInput
                          style={styles.setInput}
                          value={set.distance?.toString() || ''}
                          onChangeText={(v) => updateSet(exIdx, setIdx, 'distance', v)}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor={Colors.textLight}
                        />
                        <Text style={styles.setUnit}>km</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.setInputs}>
                      <View style={styles.setField}>
                        <TextInput
                          style={styles.setInput}
                          value={set.weight?.toString() || ''}
                          onChangeText={(v) => updateSet(exIdx, setIdx, 'weight', v)}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor={Colors.textLight}
                        />
                      </View>
                      <Text style={styles.setX}>×</Text>
                      <View style={styles.setField}>
                        <TextInput
                          style={styles.setInput}
                          value={set.reps?.toString() || ''}
                          onChangeText={(v) => updateSet(exIdx, setIdx, 'reps', v)}
                          keyboardType="numeric"
                          placeholder="10"
                          placeholderTextColor={Colors.textLight}
                        />
                      </View>
                    </View>
                  )}
                  {exercise.sets.length > 1 && (
                    <TouchableOpacity onPress={() => removeSet(exIdx, setIdx)}>
                      <Ionicons name="remove-circle-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exIdx)}>
                <Ionicons name="add-outline" size={16} color={Colors.primary} />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </Card>
          );
        })}

        <View style={styles.bottomBtn}>
          <Button
            title={editId ? 'Update Workout' : 'Save Workout'}
            onPress={handleSave}
            size="lg"
            loading={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { marginHorizontal: Spacing.md, marginBottom: Spacing.md },
  calPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent + '15', borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  calPreviewText: { fontSize: 13, color: Colors.accent, fontWeight: '500' },
  exercisesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  exercisesTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  addExBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: BorderRadius.full },
  addExText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  catChip: { backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, marginRight: 8 },
  catChipText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  exItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  exItemName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  exItemMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  exCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  exName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  setHeaderNum: { width: 32, fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  setHeaderLabel: { flex: 1, fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNum: { width: 32, fontSize: 13, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  setInputs: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  setField: { flex: 1, alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 8 },
  setInput: { fontSize: 15, fontWeight: '600', color: Colors.text, textAlign: 'center', width: '100%' },
  setUnit: { fontSize: 11, color: Colors.textSecondary, marginLeft: 4 },
  setX: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 6 },
  addSetText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  bottomBtn: { marginHorizontal: Spacing.md, marginVertical: Spacing.md },
});
