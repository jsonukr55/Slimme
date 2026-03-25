import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FoodItem } from '@/types/food';
import { FOOD_DATABASE as LOCAL_DB } from '@/constants/food-database';

const CACHE_KEY = 'food_database_cache';
const FIRESTORE_DOC = 'app_data/food_database';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface CacheEntry {
  items: FoodItem[];
  cachedAt: number;
}

export function useFoodDatabase() {
  const [foods, setFoods] = useState<FoodItem[]>(LOCAL_DB);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    setLoading(true);
    try {
      // 1. Try AsyncStorage cache first (fast)
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        const age = Date.now() - entry.cachedAt;
        if (age < CACHE_TTL_MS && entry.items.length > 0) {
          setFoods(entry.items);
          setLoading(false);
          return;
        }
      }

      // 2. Fetch from Firestore
      const docRef = doc(db, 'app_data', 'food_database');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const items = snap.data().items as FoodItem[];
        if (items && items.length > 0) {
          setFoods(items);
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ items, cachedAt: Date.now() }));
          setLoading(false);
          return;
        }
      }

      // 3. Firestore empty → seed it with local DB and cache
      await seedToFirestore();
    } catch {
      // Network error or Firestore unavailable → use local fallback
      setFoods(LOCAL_DB);
    } finally {
      setLoading(false);
    }
  };

  const seedToFirestore = useCallback(async () => {
    try {
      const docRef = doc(db, 'app_data', 'food_database');
      await setDoc(docRef, { items: LOCAL_DB, seededAt: new Date().toISOString() });
      setFoods(LOCAL_DB);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ items: LOCAL_DB, cachedAt: Date.now() }));
    } catch {
      setFoods(LOCAL_DB);
    }
  }, []);

  const invalidateCache = useCallback(async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    await loadFoods();
  }, []);

  const searchFoods = useCallback(
    (query: string): FoodItem[] => {
      if (!query.trim()) return foods;
      const q = query.toLowerCase();
      return foods.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.brand ?? '').toLowerCase().includes(q)
      );
    },
    [foods]
  );

  return { foods, loading, searchFoods, invalidateCache };
}
