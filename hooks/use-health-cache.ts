import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthData } from './use-health-connect';

const CACHE_KEY = 'health_sync_cache';

interface HealthCache {
  data: HealthData;
  syncedAt: string;
}

export function useHealthCache() {
  const [cache, setCache] = useState<HealthCache | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY).then((raw) => {
      if (raw) {
        try { setCache(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const saveHealthData = useCallback(async (data: HealthData) => {
    const entry: HealthCache = { data, syncedAt: new Date().toISOString() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    setCache(entry);
  }, []);

  return { cache, saveHealthData };
}
