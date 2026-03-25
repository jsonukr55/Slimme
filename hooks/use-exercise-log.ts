import { useState, useEffect, useCallback } from 'react';
import { WorkoutEntry } from '@/types/exercise';
import { getForDate, appendToDate, removeFromDate, updateInDate, getData, setData } from '@/lib/storage';
import { getDateKey } from '@/lib/date-utils';
import { generateId } from '@/lib/id';
import { trackWorkoutAdded } from '@/lib/achievement-tracker';

const STORAGE_KEY = 'workouts';
const TOTAL_KEY = 'total_workouts';

export function useExerciseLog(date?: string) {
  const dateKey = date || getDateKey();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getForDate<WorkoutEntry[]>(STORAGE_KEY, dateKey);
    setWorkouts(data || []);
    setLoading(false);
  }, [dateKey]);

  useEffect(() => {
    load();
  }, [load]);

  const addWorkout = async (workout: Omit<WorkoutEntry, 'id' | 'date' | 'timestamp'>) => {
    const newWorkout: WorkoutEntry = {
      ...workout,
      id: generateId(),
      date: dateKey,
      timestamp: Date.now(),
    };
    await appendToDate(STORAGE_KEY, dateKey, newWorkout);
    const total = (await getData<number>(TOTAL_KEY)) || 0;
    await setData(TOTAL_KEY, total + 1);
    await load();
    trackWorkoutAdded().catch(() => {});
    return newWorkout;
  };

  const updateWorkout = async (id: string, workout: Omit<WorkoutEntry, 'id' | 'date' | 'timestamp'>) => {
    await updateInDate<WorkoutEntry>(STORAGE_KEY, dateKey, id, (existing) => ({
      ...existing,
      ...workout,
    }));
    await load();
  };

  const removeWorkout = async (id: string) => {
    await removeFromDate(STORAGE_KEY, dateKey, id);
    const total = (await getData<number>(TOTAL_KEY)) || 0;
    if (total > 0) await setData(TOTAL_KEY, total - 1);
    await load();
  };

  const getTotalCaloriesBurned = () => {
    return workouts.reduce((total, w) => total + w.caloriesBurned, 0);
  };

  const getTotalDuration = () => {
    return workouts.reduce((total, w) => total + w.durationMinutes, 0);
  };

  return {
    workouts,
    loading,
    addWorkout,
    updateWorkout,
    removeWorkout,
    getTotalCaloriesBurned,
    getTotalDuration,
    refresh: load,
  };
}
