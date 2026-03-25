import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('hunter_quests', {
        name: 'Hunter Quest Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }, []);

  /** Schedule a daily evening reminder for incomplete quests */
  const scheduleDailyQuestReminder = useCallback(async () => {
    // Cancel existing quest reminders first
    await cancelQuestReminders();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚔️ System Alert',
        body: 'Daily quests are expiring soon, Hunter. Complete them before midnight.',
        sound: 'default',
        data: { type: 'daily_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });

    return id;
  }, []);

  /** Notify when a quest is almost due */
  const scheduleQuestDeadlineAlert = useCallback(
    async (questTitle: string, expiresAt: string): Promise<string | null> => {
      const deadline = new Date(expiresAt);
      const alertTime = new Date(deadline.getTime() - 2 * 60 * 60 * 1000); // 2h before
      if (alertTime <= new Date()) return null;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Quest Deadline',
          body: `"${questTitle}" expires in 2 hours. Complete it now!`,
          sound: 'default',
          data: { type: 'quest_deadline' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: alertTime,
        },
      });
      return id;
    },
    []
  );

  /** Fire an instant notification on quest completion */
  const notifyQuestComplete = useCallback(async (questTitle: string, xpReward: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Quest Complete!',
        body: `"${questTitle}" conquered. +${xpReward} XP earned.`,
        sound: 'default',
        data: { type: 'quest_complete' },
      },
      trigger: null, // immediate
    });
  }, []);

  /** Fire an instant notification on rank up */
  const notifyRankUp = useCallback(async (newRank: string, newTitle: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 Rank Up! ${newRank}-Rank`,
        body: `You have become "${newTitle}". The System acknowledges your power.`,
        sound: 'default',
        data: { type: 'rank_up' },
      },
      trigger: null,
    });
  }, []);

  /** Notify on new trophy star */
  const notifyTrophyStar = useCallback(async (trophyTitle: string, stars: number) => {
    const starString = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏅 Trophy Updated!',
        body: `"${trophyTitle}" ${starString}`,
        sound: 'default',
        data: { type: 'trophy_star' },
      },
      trigger: null,
    });
  }, []);

  const cancelQuestReminders = useCallback(async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const questNotifications = scheduled.filter(
      (n) => n.content.data?.type === 'daily_reminder' || n.content.data?.type === 'quest_deadline'
    );
    await Promise.all(questNotifications.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  }, []);

  const cancelNotification = useCallback(async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id);
  }, []);

  return {
    requestPermissions,
    scheduleDailyQuestReminder,
    scheduleQuestDeadlineAlert,
    notifyQuestComplete,
    notifyRankUp,
    notifyTrophyStar,
    cancelQuestReminders,
    cancelNotification,
  };
}
