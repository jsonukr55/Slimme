import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HunterStats } from '@/types/hunter';

interface Props {
  stats: HunterStats;
}

const STAT_DEFS: {
  key: keyof HunterStats;
  label: string;
  gradient: [string, string];
}[] = [
  { key: 'strength',     label: 'Strength',     gradient: ['#EF4444', '#DC2626'] },
  { key: 'agility',      label: 'Agility',       gradient: ['#10B981', '#059669'] },
  { key: 'vitality',     label: 'Vitality',      gradient: ['#3B82F6', '#2563EB'] },
  { key: 'intelligence', label: 'Intelligence',  gradient: ['#F59E0B', '#D97706'] },
  { key: 'sense',        label: 'Sense',         gradient: ['#8B5CF6', '#7C3AED'] },
];

// Overall = average of all stats
function getOverall(stats: HunterStats) {
  const vals = Object.values(stats);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function StatsPanel({ stats }: Props) {
  const [tab, setTab] = useState<'current' | 'potential'>('current');
  const overall = getOverall(stats);
  // Potential = current + 20% theoretical growth
  const potential = Math.round(overall * 1.2);

  return (
    <View style={styles.container}>
      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'current' && styles.tabBtnActive]}
          onPress={() => setTab('current')}
        >
          <Text style={[styles.tabText, tab === 'current' && styles.tabTextActive]}>Current</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'potential' && styles.tabBtnActive]}
          onPress={() => setTab('potential')}
        >
          <Text style={[styles.tabText, tab === 'potential' && styles.tabTextActive]}>Potential</Text>
        </TouchableOpacity>
      </View>

      {/* Overall tile — full width */}
      <LinearGradient
        colors={['#FF6B35', '#FF3D71']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tile, styles.tileOverall]}
      >
        <Text style={styles.tileLabel}>Overall</Text>
        <View style={styles.tileValueRow}>
          <Text style={styles.tileValue}>{tab === 'current' ? overall : potential}</Text>
          <Text style={styles.tileChange}>
            {tab === 'potential' ? ` (+${potential - overall})` : ''}
          </Text>
        </View>
      </LinearGradient>

      {/* 2-column stat grid */}
      <View style={styles.grid}>
        {STAT_DEFS.map(({ key, label, gradient }) => {
          const val = stats[key];
          const potVal = Math.round(val * 1.2);
          return (
            <LinearGradient
              key={key}
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.tile, styles.tileGrid]}
            >
              <Text style={styles.tileLabel}>{label}</Text>
              <View style={styles.tileValueRow}>
                <Text style={styles.tileValue}>{tab === 'current' ? val : potVal}</Text>
                {tab === 'potential' && (
                  <Text style={styles.tileChange}> (+{potVal - val})</Text>
                )}
              </View>
            </LinearGradient>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2D2D4E',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 7,
  },
  tabBtnActive: {
    backgroundColor: '#374151',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 0,
  },
  tileOverall: {
    marginBottom: 8,
  },
  tileGrid: {
    width: '47.5%',
  },
  tileLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tileValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tileChange: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
});
