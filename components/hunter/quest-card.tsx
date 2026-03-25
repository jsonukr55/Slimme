import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Quest, QuestDifficulty } from '@/types/hunter';

// Each category gets a vivid gradient
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  health:    ['#FF6B35', '#FF3D71'],
  exercise:  ['#0EA5E9', '#6366F1'],
  workout:   ['#8B5CF6', '#EC4899'],
  nutrition: ['#10B981', '#059669'],
  custom:    ['#F59E0B', '#EF4444'],
};

const DIFFICULTY_STARS: Record<QuestDifficulty, number> = {
  easy: 1, normal: 2, hard: 3, elite: 4, legendary: 5,
};

interface Props {
  quest: Quest;
  onComplete: (quest: Quest) => void;
  onPress?: (quest: Quest) => void;
}

export function QuestCard({ quest, onComplete, onPress }: Props) {
  const isCompleted = quest.status === 'completed';
  const gradient = CATEGORY_GRADIENTS[quest.category] ?? ['#374151', '#1F2937'];
  const stars = DIFFICULTY_STARS[quest.difficulty];
  const hasProgress = quest.targetValue > 1;
  const progress = hasProgress ? quest.currentValue / quest.targetValue : isCompleted ? 1 : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(quest)}
      style={[styles.wrap, isCompleted && styles.wrapDone]}
    >
      <LinearGradient
        colors={isCompleted ? ['#1F2937', '#111827'] : gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Dark overlay for done state */}
        {isCompleted && <View style={styles.doneOverlay} />}

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <Ionicons name={quest.icon as any} size={22} color="#FFF" />
          </View>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, isCompleted && styles.strikethrough]} numberOfLines={1}>
              {quest.title}
            </Text>
            <Text style={styles.desc} numberOfLines={1}>{quest.description}</Text>
          </View>
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          ) : (
            <TouchableOpacity style={styles.completeBtn} onPress={() => onComplete(quest)}>
              <Ionicons name="checkmark" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        {hasProgress && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{quest.currentValue}/{quest.targetValue} {quest.unit}</Text>
          </View>
        )}

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          {/* Difficulty stars */}
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map((i) => (
              <Text key={i} style={[styles.star, i <= stars ? styles.starOn : styles.starOff]}>★</Text>
            ))}
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="flash-outline" size={12} color="#FFD700" />
            <Text style={styles.xpText}>+{quest.xpReward} XP</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.periodText}>{quest.period === 'daily' ? 'Daily' : quest.period === 'weekly' ? 'Weekly' : 'Custom'}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  wrapDone: {
    opacity: 0.7,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    opacity: 0.3,
    borderRadius: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.5)',
  },
  desc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  completeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  progressWrap: {
    marginBottom: 10,
    gap: 4,
  },
  progressBg: {
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
    opacity: 0.9,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 13,
  },
  starOn: {
    color: '#FFF',
  },
  starOff: {
    color: 'rgba(255,255,255,0.25)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 12,
  },
  dot: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  periodText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
});
