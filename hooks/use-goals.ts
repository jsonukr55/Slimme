import { useState, useEffect, useCallback } from 'react';
import { FitnessGoals } from '@/types/goals';
import { getData, setData } from '@/lib/storage';
import { trackGoalSet } from '@/lib/achievement-tracker';

const STORAGE_KEY = 'goals';

const DEFAULT_GOALS: FitnessGoals = {
  dailyCalories: 2000,
  dailyProtein: 120,
  dailyCarbs: 250,
  dailyFat: 65,
  dailyFiber: 25,
  weeklyWorkouts: 4,
  weeklyCardioMinutes: 150,
};

export function useGoals() {
  const [goals, setGoals] = useState<FitnessGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getData<FitnessGoals>(STORAGE_KEY);
    if (data) setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateGoals = async (newGoals: Partial<FitnessGoals>) => {
    const updated = { ...goals, ...newGoals };
    await setData(STORAGE_KEY, updated);
    setGoals(updated);
    trackGoalSet().catch(() => {});
  };

  return { goals, loading, updateGoals };
}
