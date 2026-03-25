import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, getUserId } from '@/lib/firebase';
import { FoodItem } from '@/types/food';

const CACHE_KEY = 'custom_foods_cache';

export function useCustomFoods() {
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setCustomFoods(JSON.parse(cached));
      const uid = await getUserId();
      const snap = await getDoc(doc(db, 'users', uid, 'kv', 'custom_foods'));
      if (snap.exists()) {
        const items = (snap.data().value as FoodItem[]) || [];
        setCustomFoods(items);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
      }
    } catch {
      // use cached fallback
    }
  };

  const saveFood = useCallback(async (food: FoodItem) => {
    try {
      const uid = await getUserId();
      const updated = [...customFoods];
      const idx = updated.findIndex(
        (f) => f.id === food.id || f.name.toLowerCase() === food.name.toLowerCase()
      );
      if (idx >= 0) updated[idx] = food;
      else updated.unshift(food);
      setCustomFoods(updated);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      await setDoc(doc(db, 'users', uid, 'kv', 'custom_foods'), { value: updated });
    } catch (e) {
      console.error('Failed to save custom food:', e);
    }
  }, [customFoods]);

  const searchCustomFoods = useCallback(
    (query: string): FoodItem[] => {
      if (!query.trim()) return customFoods;
      const q = query.toLowerCase();
      return customFoods.filter((f) => f.name.toLowerCase().includes(q));
    },
    [customFoods]
  );

  return { customFoods, saveFood, searchCustomFoods, reload: load };
}
