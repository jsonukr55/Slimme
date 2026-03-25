import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HunterRank } from '@/types/hunter';
import { RANK_COLORS } from '@/constants/hunter-quests';

interface Props {
  rank: HunterRank;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { badge: 28, font: 12 },
  md: { badge: 40, font: 18 },
  lg: { badge: 60, font: 28 },
};

export function RankBadge({ rank, size = 'md' }: Props) {
  const color = RANK_COLORS[rank];
  const { badge, font } = SIZES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          width: badge,
          height: badge,
          borderRadius: badge / 2,
          borderColor: color,
          backgroundColor: color + '22',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: font, color }]}>{rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '900',
    letterSpacing: 1,
  },
});
