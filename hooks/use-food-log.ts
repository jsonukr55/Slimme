import { useState, useEffect, useCallback } from 'react';
import { FoodLogEntry, MealType, NutrientInfo } from '@/types/food';
import { getForDate, appendToDate, removeFromDate } from '@/lib/storage';
import { getDateKey } from '@/lib/date-utils';
import { generateId } from '@/lib/id';
import { trackFoodLogged } from '@/lib/achievement-tracker';

const STORAGE_KEY = 'food_log';

export function useFoodLog(date?: string) {
  const dateKey = date || getDateKey();
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getForDate<FoodLogEntry[]>(STORAGE_KEY, dateKey);
    setEntries(data || []);
    setLoading(false);
  }, [dateKey]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = async (entry: Omit<FoodLogEntry, 'id' | 'date' | 'timestamp'>) => {
    const newEntry: FoodLogEntry = {
      ...entry,
      id: generateId(),
      date: dateKey,
      timestamp: Date.now(),
    };
    await appendToDate(STORAGE_KEY, dateKey, newEntry);
    await load();
    trackFoodLogged(dateKey).catch(() => {});
    return newEntry;
  };

  const removeEntry = async (id: string) => {
    await removeFromDate(STORAGE_KEY, dateKey, id);
    await load();
  };

  const getEntriesByMeal = (mealType: MealType) => {
    return entries.filter((e) => e.mealType === mealType);
  };

  const getDailyTotals = (): NutrientInfo => {
    return entries.reduce(
      (totals, entry) => {
        const q = entry.quantity;
        return {
          calories: totals.calories + entry.foodItem.nutrients.calories * q,
          protein: totals.protein + entry.foodItem.nutrients.protein * q,
          carbs: totals.carbs + entry.foodItem.nutrients.carbs * q,
          fat: totals.fat + entry.foodItem.nutrients.fat * q,
          fiber: totals.fiber + entry.foodItem.nutrients.fiber * q,
          sugar: (totals.sugar || 0) + (entry.foodItem.nutrients.sugar || 0) * q,
          sodium: (totals.sodium || 0) + (entry.foodItem.nutrients.sodium || 0) * q,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  };

  const getMealTotals = (mealType: MealType): NutrientInfo => {
    const mealEntries = getEntriesByMeal(mealType);
    return mealEntries.reduce(
      (totals, entry) => {
        const q = entry.quantity;
        return {
          calories: totals.calories + entry.foodItem.nutrients.calories * q,
          protein: totals.protein + entry.foodItem.nutrients.protein * q,
          carbs: totals.carbs + entry.foodItem.nutrients.carbs * q,
          fat: totals.fat + entry.foodItem.nutrients.fat * q,
          fiber: totals.fiber + entry.foodItem.nutrients.fiber * q,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  return {
    entries,
    loading,
    addEntry,
    removeEntry,
    getEntriesByMeal,
    getDailyTotals,
    getMealTotals,
    refresh: load,
  };
}
