import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  label?: string;
  showValue?: boolean;
  unit?: string;
  height?: number;
}

export function ProgressBar({ value, max, color, label, showValue = true, unit = 'g', height = 10 }: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = value > max;

  return (
    <View style={styles.container}>
      {(label || showValue) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValue && (
            <Text style={[styles.value, isOver && { color: Colors.error }]}>
              {Math.round(value)}/{max}{unit}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: isOver ? Colors.error : color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  value: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  track: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
