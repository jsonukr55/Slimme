import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest, QuestTemplate, QuestStatus } from '@/types/hunter';
import {
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  DAILY_QUEST_COUNT,
} from '@/constants/hunter-quests';

const QUESTS_KEY_PREFIX = 'hunter_quests_';
const WEEKLY_QUESTS_KEY = 'hunter_weekly_quests';

function getDateKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getWeekKey() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function seedDailyQuests(date: string): Quest[] {
  // Pick DAILY_QUEST_COUNT random templates, deterministically based on date
  const seed = date.replace(/-/g, '');
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort((a, b) => {
    const ha = parseInt(seed + a.id.charCodeAt(2).toString(), 10) % 100;
    const hb = parseInt(seed + b.id.charCodeAt(2).toString(), 10) % 100;
    return ha - hb;
  });

  const selected = shuffled.slice(0, DAILY_QUEST_COUNT);
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 0);

  return selected.map((t) => templateToQuest(t, expiresAt.toISOString()));
}

function seedWeeklyQuests(week: string): Quest[] {
  const expiresAt = new Date();
  // Expire at end of Sunday
  const daysUntilSunday = 7 - expiresAt.getDay();
  expiresAt.setDate(expiresAt.getDate() + daysUntilSunday);
  expiresAt.setHours(23, 59, 59, 0);

  return WEEKLY_QUEST_TEMPLATES.map((t) => templateToQuest(t, expiresAt.toISOString()));
}

function templateToQuest(t: QuestTemplate, expiresAt: string): Quest {
  return {
    id: `${t.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: t.title,
    description: t.description,
    category: t.category,
    difficulty: t.difficulty,
    period: t.period,
    xpReward: t.xpReward,
    statReward: t.statReward,
    targetValue: t.targetValue,
    currentValue: 0,
    unit: t.unit,
    status: 'active',
    isCustom: false,
    isPreset: true,
    icon: t.icon,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
}

export function useQuests() {
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [customQuests, setCustomQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    setLoading(true);
    try {
      const dateKey = getDateKey();
      const weekKey = getWeekKey();
      const dailyStorageKey = `${QUESTS_KEY_PREFIX}daily_${dateKey}`;

      const [dailyRaw, weeklyRaw, customRaw] = await Promise.all([
        AsyncStorage.getItem(dailyStorageKey),
        AsyncStorage.getItem(`${WEEKLY_QUESTS_KEY}_${weekKey}`),
        AsyncStorage.getItem('hunter_custom_quests'),
      ]);

      // Daily quests: seed if not present for today
      if (dailyRaw) {
        setDailyQuests(JSON.parse(dailyRaw));
      } else {
        const seeded = seedDailyQuests(dateKey);
        await AsyncStorage.setItem(dailyStorageKey, JSON.stringify(seeded));
        setDailyQuests(seeded);
      }

      // Weekly quests: seed if not present for this week
      if (weeklyRaw) {
        setWeeklyQuests(JSON.parse(weeklyRaw));
      } else {
        const seeded = seedWeeklyQuests(weekKey);
        await AsyncStorage.setItem(`${WEEKLY_QUESTS_KEY}_${weekKey}`, JSON.stringify(seeded));
        setWeeklyQuests(seeded);
      }

      setCustomQuests(customRaw ? JSON.parse(customRaw) : []);
    } finally {
      setLoading(false);
    }
  };

  const saveDailyQuests = async (quests: Quest[]) => {
    const key = `${QUESTS_KEY_PREFIX}daily_${getDateKey()}`;
    await AsyncStorage.setItem(key, JSON.stringify(quests));
    setDailyQuests(quests);
  };

  const saveWeeklyQuests = async (quests: Quest[]) => {
    const key = `${WEEKLY_QUESTS_KEY}_${getWeekKey()}`;
    await AsyncStorage.setItem(key, JSON.stringify(quests));
    setWeeklyQuests(quests);
  };

  const saveCustomQuests = async (quests: Quest[]) => {
    await AsyncStorage.setItem('hunter_custom_quests', JSON.stringify(quests));
    setCustomQuests(quests);
  };

  const completeQuest = useCallback(
    async (questId: string): Promise<Quest | null> => {
      // Search in all quest lists
      let found: Quest | null = null;

      const tryComplete = (quests: Quest[], save: (q: Quest[]) => Promise<void>) => {
        const idx = quests.findIndex((q) => q.id === questId);
        if (idx === -1) return false;
        const updated = [...quests];
        updated[idx] = { ...updated[idx], status: 'completed', completedAt: new Date().toISOString() };
        found = updated[idx];
        save(updated);
        return true;
      };

      tryComplete(dailyQuests, saveDailyQuests) ||
        tryComplete(weeklyQuests, saveWeeklyQuests) ||
        tryComplete(customQuests, saveCustomQuests);

      return found;
    },
    [dailyQuests, weeklyQuests, customQuests]
  );

  const updateQuestProgress = useCallback(
    async (questId: string, progress: number): Promise<Quest | null> => {
      let found: Quest | null = null;

      const tryUpdate = (quests: Quest[], save: (q: Quest[]) => Promise<void>) => {
        const idx = quests.findIndex((q) => q.id === questId);
        if (idx === -1) return false;
        const updated = [...quests];
        const quest = updated[idx];
        const newValue = Math.min(progress, quest.targetValue);
        const completed = newValue >= quest.targetValue;
        updated[idx] = {
          ...quest,
          currentValue: newValue,
          status: completed ? 'completed' : 'active',
          completedAt: completed ? new Date().toISOString() : quest.completedAt,
        };
        found = updated[idx];
        save(updated);
        return true;
      };

      tryUpdate(dailyQuests, saveDailyQuests) ||
        tryUpdate(weeklyQuests, saveWeeklyQuests) ||
        tryUpdate(customQuests, saveCustomQuests);

      return found;
    },
    [dailyQuests, weeklyQuests, customQuests]
  );

  const addCustomQuest = useCallback(
    async (quest: Omit<Quest, 'id' | 'createdAt' | 'status' | 'currentValue' | 'isPreset'>) => {
      const newQuest: Quest = {
        ...quest,
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        currentValue: 0,
        status: 'active',
        isPreset: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [...customQuests, newQuest];
      await saveCustomQuests(updated);
      return newQuest;
    },
    [customQuests]
  );

  const deleteCustomQuest = useCallback(
    async (questId: string) => {
      const updated = customQuests.filter((q) => q.id !== questId);
      await saveCustomQuests(updated);
    },
    [customQuests]
  );

  const allActiveQuests = [
    ...dailyQuests.filter((q) => q.status === 'active'),
    ...weeklyQuests.filter((q) => q.status === 'active'),
    ...customQuests.filter((q) => q.status === 'active'),
  ];

  const allCompletedToday = [...dailyQuests, ...weeklyQuests, ...customQuests].filter(
    (q) =>
      q.status === 'completed' &&
      q.completedAt &&
      q.completedAt.startsWith(getDateKey())
  );

  return {
    dailyQuests,
    weeklyQuests,
    customQuests,
    allActiveQuests,
    allCompletedToday,
    loading,
    completeQuest,
    updateQuestProgress,
    addCustomQuest,
    deleteCustomQuest,
    reload: loadQuests,
  };
}
