import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useHunter } from '@/hooks/use-hunter';
import { TrophyCard } from '@/components/hunter/trophy-card';

const CATEGORIES = ['all', 'quests', 'health', 'exercise', 'workout', 'nutrition', 'consistency', 'hunter'];

export default function TrophiesScreen() {
  const { trophies } = useHunter();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? trophies : trophies.filter((t) => t.category === filter);
  const totalStars = trophies.reduce((s, t) => s + t.starsEarned, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.systemText}>[ SYSTEM: TROPHY VAULT ]</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryStars}>★ {totalStars} / {trophies.length * 5}</Text>
        <Text style={styles.summaryLabel}>Total Stars Earned</Text>
      </View>

      <Text style={styles.hintText}>
        {trophies.filter(t => t.starsEarned === 0).length} trophies locked — complete quests to unlock
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, filter === cat && styles.chipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.grid}>
        {filtered.map((trophy) => (
          <TrophyCard key={trophy.id} trophy={trophy} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  content: { padding: 14, paddingBottom: 40 },
  systemText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },
  summary: {
    alignItems: 'center',
    backgroundColor: '#1A0A2E',
    borderRadius: 14,
    padding: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2D1A4E',
  },
  summaryStars: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  summaryLabel: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  hintText: {
    color: '#4B5563',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  filterScroll: { marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D4E',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
});
