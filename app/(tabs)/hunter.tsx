import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHunter } from '@/hooks/use-hunter';
import { useQuests } from '@/hooks/use-quests';
import { useNotifications } from '@/hooks/use-notifications';
import { RankBadge } from '@/components/hunter/rank-badge';
import { QuestCard } from '@/components/hunter/quest-card';
import { StatsPanel } from '@/components/hunter/stats-panel';
import { TrophyCard } from '@/components/hunter/trophy-card';
import { Quest, QuestCategory } from '@/types/hunter';
import { RANK_COLORS } from '@/constants/hunter-quests';

type MainTab = 'quests' | 'stats' | 'trophies';
type QuestFilter = 'all' | QuestCategory;

const QUEST_FILTERS: { value: QuestFilter; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'health',    label: 'Health' },
  { value: 'exercise',  label: 'Exercise' },
  { value: 'workout',   label: 'Workout' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'custom',    label: 'Custom' },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export default function HunterScreen() {
  const { profile, trophies, loading: hunterLoading, activateHunterMode, resetHunterMode, addXP, incrementTrophyProgress } = useHunter();
  const { dailyQuests, weeklyQuests, customQuests, completeQuest, allCompletedToday } = useQuests();
  const { requestPermissions, scheduleDailyQuestReminder, notifyQuestComplete, notifyRankUp } = useNotifications();

  const [mainTab, setMainTab] = useState<MainTab>('quests');
  const [questFilter, setQuestFilter] = useState<QuestFilter>('all');
  const [questPeriod, setQuestPeriod] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [showActivate, setShowActivate] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const handleActivate = useCallback(async () => {
    await activateHunterMode();
    const granted = await requestPermissions();
    if (granted) await scheduleDailyQuestReminder();
    setShowActivate(false);
  }, [activateHunterMode, requestPermissions, scheduleDailyQuestReminder]);

  const handleCompleteQuest = useCallback(
    async (quest: Quest) => {
      if (completing) return;
      setCompleting(quest.id);
      try {
        const done = await completeQuest(quest.id);
        if (!done) return;

        const result = await addXP(quest.xpReward, quest.statReward);
        await notifyQuestComplete(quest.title, quest.xpReward);
        await incrementTrophyProgress('trophy_iron_will', 1);
        await incrementTrophyProgress('trophy_arise', 1);

        if (result.rankUp) {
          await notifyRankUp(profile.rank, profile.title);
          Alert.alert(
            '🏆 RANK UP!',
            `You have ascended to ${profile.rank}-Rank!\n"${profile.title}"`,
            [{ text: 'ARISE', style: 'default' }]
          );
        }
      } finally {
        setCompleting(null);
      }
    },
    [completing, completeQuest, addXP, notifyQuestComplete, incrementTrophyProgress, notifyRankUp, profile]
  );

  if (hunterLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.systemText}>[ SYSTEM LOADING... ]</Text>
      </View>
    );
  }

  // ─── Activation screen ────────────────────────────────────────────────────
  if (!profile.isActive) {
    return (
      <LinearGradient colors={['#0D0D1A', '#1A0A2E', '#0D0D1A']} style={styles.activateScreen}>
        <View style={styles.activateGlow} />
        <Ionicons name="skull-outline" size={90} color="#7C3AED" style={{ marginBottom: 24 }} />
        <Text style={styles.bigTitle}>HUNTER MODE</Text>
        <Text style={styles.subtitle}>
          The System has chosen you.{'\n'}Accept the call and begin your ascent.
        </Text>
        <TouchableOpacity style={styles.activateBtn} onPress={() => setShowActivate(true)}>
          <LinearGradient colors={['#7C3AED', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.activateBtnGradient}>
            <Text style={styles.activateBtnText}>[ ACTIVATE SYSTEM ]</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Modal visible={showActivate} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>⚔️ System Awakening</Text>
              <Text style={styles.modalBody}>
                You are about to activate Hunter Mode.{'\n\n'}
                Daily quests will be assigned.{'\n'}
                Failure means stagnation.{'\n'}
                Completion means power.{'\n\n'}
                Do you accept the System's contract?
              </Text>
              <TouchableOpacity onPress={handleActivate}>
                <LinearGradient colors={['#7C3AED', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalConfirm}>
                  <Text style={styles.modalConfirmText}>I ACCEPT</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowActivate(false)}>
                <Text style={styles.modalCancel}>Not yet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    );
  }

  // ─── Active Hunter ────────────────────────────────────────────────────────
  const rankColor = RANK_COLORS[profile.rank];
  const xpPercent = (profile.currentLevelXP / profile.nextLevelXP) * 100;
  const dayOfYear = getDayOfYear();
  const totalDays = 366;

  const rawQuests = questPeriod === 'daily' ? dailyQuests : questPeriod === 'weekly' ? weeklyQuests : customQuests;
  const filteredQuests = questFilter === 'all' ? rawQuests : rawQuests.filter((q) => q.category === questFilter);
  const doneCount = allCompletedToday.length;
  const activeCount = [...dailyQuests, ...customQuests].filter((q) => q.status === 'active').length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Profile Header ──────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#1A0A2E', '#0D0D1A']}
          style={styles.profileCard}
        >
          {/* Day counter */}
          <View style={styles.dayRow}>
            <Text style={styles.dayText}>Day {dayOfYear}/{totalDays}</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  '⚠️ Reset Hunter Mode',
                  'This will erase all XP, rank, stats, trophies and quests. You will start from E-Rank again.\n\nThis cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: resetHunterMode,
                    },
                  ]
                )
              }
            >
              <Ionicons name="refresh-outline" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <RankBadge rank={profile.rank} size="lg" />
            <View style={styles.profileInfo}>
              <Text style={[styles.rankTitle, { color: rankColor }]}>{profile.title}</Text>
              <Text style={styles.levelText}>Level {profile.level} · {profile.totalXP.toLocaleString()} XP</Text>
              {/* XP bar */}
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${xpPercent}%`, backgroundColor: rankColor }]} />
              </View>
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={[styles.quickVal, { color: '#10B981' }]}>{doneCount}</Text>
              <Text style={styles.quickLabel}>Done Today</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickStat}>
              <Text style={[styles.quickVal, { color: '#F59E0B' }]}>{activeCount}</Text>
              <Text style={styles.quickLabel}>Active</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickStat}>
              <Text style={[styles.quickVal, { color: '#7C3AED' }]}>{profile.currentStreak}</Text>
              <Text style={styles.quickLabel}>Streak</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickStat}>
              <Text style={[styles.quickVal, { color: '#3B82F6' }]}>{profile.questsCompleted}</Text>
              <Text style={styles.quickLabel}>Completed</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Main Tab Bar ────────────────────────────────────────────────── */}
        <View style={styles.mainTabRow}>
          {([
            { key: 'quests',   label: 'Quests',   icon: 'list-outline' },
            { key: 'stats',    label: 'Stats',    icon: 'stats-chart-outline' },
            { key: 'trophies', label: 'Trophies', icon: 'trophy-outline' },
          ] as const).map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.mainTabBtn, mainTab === key && styles.mainTabBtnActive]}
              onPress={() => setMainTab(key)}
            >
              <Ionicons name={icon} size={16} color={mainTab === key ? '#FFF' : '#6B7280'} />
              <Text style={[styles.mainTabText, mainTab === key && styles.mainTabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quests Tab ──────────────────────────────────────────────────── */}
        {mainTab === 'quests' && (
          <>
            {/* Period selector */}
            <View style={styles.periodRow}>
              {(['daily', 'weekly', 'custom'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, questPeriod === p && styles.periodBtnActive]}
                  onPress={() => setQuestPeriod(p)}
                >
                  <Text style={[styles.periodText, questPeriod === p && styles.periodTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {QUEST_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.filterChip, questFilter === f.value && styles.filterChipActive]}
                  onPress={() => setQuestFilter(f.value)}
                >
                  <Text style={[styles.filterChipText, questFilter === f.value && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Quest list */}
            {filteredQuests.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No quests here.</Text>
              </View>
            ) : (
              filteredQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} onComplete={handleCompleteQuest} />
              ))
            )}

            {/* Add custom quest button */}
            <TouchableOpacity style={styles.addQuestBtn} onPress={() => router.push('/hunter/add-quest' as any)}>
              <Ionicons name="add-circle-outline" size={20} color="#7C3AED" />
              <Text style={styles.addQuestText}>Add Custom Quest</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Stats Tab ───────────────────────────────────────────────────── */}
        {mainTab === 'stats' && (
          <StatsPanel stats={profile.stats} />
        )}

        {/* ── Trophies Tab ────────────────────────────────────────────────── */}
        {mainTab === 'trophies' && (
          <>
            <View style={styles.trophySummary}>
              <Text style={styles.trophyStarCount}>
                ★ {trophies.reduce((s, t) => s + t.starsEarned, 0)} / {trophies.length * 5}
              </Text>
              <Text style={styles.trophySubtext}>Total Stars Earned</Text>
            </View>
            <Text style={styles.trophyUnlockHint}>
              {trophies.filter(t => t.starsEarned === 0).length} trophies still locked — complete quests to unlock
            </Text>
            <View style={styles.trophyGrid}>
              {trophies.map((trophy) => (
                <TrophyCard key={trophy.id} trophy={trophy} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  center: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 50,
  },
  systemText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  // ── Activation ────────────────────────────────────────────────────────────
  activateScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  activateGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#7C3AED',
    opacity: 0.1,
    top: '30%',
  },
  bigTitle: {
    color: '#E5E7EB',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 14,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 44,
  },
  activateBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activateBtnGradient: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
  },
  activateBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000BB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1A0A2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#7C3AED',
    width: '100%',
  },
  modalTitle: {
    color: '#E5E7EB',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBody: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalConfirm: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  modalCancel: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },
  // ── Profile Card ──────────────────────────────────────────────────────────
  profileCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D1A4E',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayText: {
    color: '#E5E7EB',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  daySubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  profileInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levelText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  xpBarBg: {
    height: 5,
    backgroundColor: '#2D2D4E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  quickLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  quickDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#2D2D4E',
  },
  // ── Main Tabs ─────────────────────────────────────────────────────────────
  mainTabRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2D2D4E',
    gap: 4,
  },
  mainTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 9,
  },
  mainTabBtnActive: {
    backgroundColor: '#7C3AED',
  },
  mainTabText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
  mainTabTextActive: {
    color: '#FFF',
  },
  // ── Quest filters ─────────────────────────────────────────────────────────
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D4E',
  },
  periodBtnActive: {
    backgroundColor: '#374151',
    borderColor: '#6B7280',
  },
  periodText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 13,
  },
  periodTextActive: {
    color: '#E5E7EB',
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D4E',
    marginRight: 7,
  },
  filterChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4B5563',
    fontSize: 14,
  },
  addQuestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2D2D4E',
    marginTop: 6,
  },
  addQuestText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 14,
  },
  // ── Trophies ──────────────────────────────────────────────────────────────
  trophySummary: {
    alignItems: 'center',
    backgroundColor: '#1A0A2E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D1A4E',
  },
  trophyStarCount: {
    color: '#FFD700',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  trophySubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  trophyUnlockHint: {
    color: '#4B5563',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
});
