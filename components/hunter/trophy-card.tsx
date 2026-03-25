import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Trophy } from '@/types/hunter';

const STAR_GRADIENTS: [string, string][] = [
  ['#CD7F32', '#A0522D'], // 1★ bronze
  ['#C0C0C0', '#9CA3AF'], // 2★ silver
  ['#FFD700', '#F59E0B'], // 3★ gold
  ['#7C3AED', '#6D28D9'], // 4★ purple
  ['#DC2626', '#991B1B'], // 5★ red/S
];

interface Props {
  trophy: Trophy;
}

export function TrophyCard({ trophy }: Props) {
  const isUnlocked = trophy.starsEarned > 0;
  const gradientIdx = Math.max(0, trophy.starsEarned - 1);
  const gradient: [string, string] = isUnlocked ? STAR_GRADIENTS[gradientIdx] : ['#1A1A2E', '#111827'];
  const nextStar = trophy.starsEarned < 5 ? trophy.starThresholds[trophy.starsEarned] : null;
  const progress = nextStar ? Math.min(trophy.currentValue / nextStar, 1) : 1;

  if (!isUnlocked) {
    return (
      <View style={styles.lockedTile}>
        <Text style={styles.questionMark}>?</Text>
        <View style={styles.lockedBar} />
      </View>
    );
  }

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
      <Ionicons name={trophy.icon as any} size={26} color="rgba(255,255,255,0.9)" />

      <Text style={styles.tileTitle} numberOfLines={2}>{trophy.title}</Text>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Text key={i} style={[styles.star, i < trophy.starsEarned ? styles.starOn : styles.starOff]}>★</Text>
        ))}
      </View>

      {/* Progress to next star */}
      {nextStar && (
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}
      {!nextStar && (
        <Text style={styles.maxed}>MAX</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lockedTile: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 14,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D4E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  questionMark: {
    color: '#374151',
    fontSize: 32,
    fontWeight: '900',
  },
  lockedBar: {
    width: '60%',
    height: 4,
    backgroundColor: '#2D2D4E',
    borderRadius: 2,
  },
  tileTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  star: {
    fontSize: 11,
  },
  starOn: {
    color: '#FFF',
  },
  starOff: {
    color: 'rgba(255,255,255,0.25)',
  },
  progressBg: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  maxed: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
