import { useState, useEffect, useCallback } from 'react';
import { WeightEntry } from '@/types/weight';
import { getData, setData, setForDate, getForDate } from '@/lib/storage';
import { getDateKey } from '@/lib/date-utils';
import { generateId } from '@/lib/id';
import { trackWeightLogged } from '@/lib/achievement-tracker';

const DAY_KEY = 'weight';
const HISTORY_KEY = 'weight_history';

export function useWeightLog() {
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getData<WeightEntry[]>(HISTORY_KEY);
    setHistory(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addWeight = async (weight: number, note?: string) => {
    const dateKey = getDateKey();
    const entry: WeightEntry = {
      id: generateId(),
      date: dateKey,
      weight,
      timestamp: Date.now(),
      note,
    };

    await setForDate(DAY_KEY, dateKey, entry);

    // Update history - replace if same date exists
    const existing = await getData<WeightEntry[]>(HISTORY_KEY) || [];
    const filtered = existing.filter((e) => e.date !== dateKey);
    filtered.push(entry);
    filtered.sort((a, b) => a.timestamp - b.timestamp);
    await setData(HISTORY_KEY, filtered);

    await load();
    const updatedHistory = [...filtered, entry].sort((a, b) => a.timestamp - b.timestamp);
    trackWeightLogged(updatedHistory).catch(() => {});
    return entry;
  };

  const getLatestWeight = (): number | null => {
    if (history.length === 0) return null;
    return history[history.length - 1].weight;
  };

  const getStartingWeight = (): number | null => {
    if (history.length === 0) return null;
    return history[0].weight;
  };

  const getWeightChange = (): number | null => {
    const start = getStartingWeight();
    const latest = getLatestWeight();
    if (start === null || latest === null) return null;
    return latest - start;
  };

  const getHistoryForRange = (days: number): WeightEntry[] => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return history.filter((e) => e.timestamp >= cutoff);
  };

  return {
    history,
    loading,
    addWeight,
    getLatestWeight,
    getStartingWeight,
    getWeightChange,
    getHistoryForRange,
    refresh: load,
  };
}
