import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  color: string;
  centerLabel?: string;
  centerValue?: string | number;
  centerSubLabel?: string;
}

export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  centerLabel,
  centerValue,
  centerSubLabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progress > 1 ? Colors.error : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        {centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
        {centerValue !== undefined && <Text style={styles.centerValue}>{centerValue}</Text>}
        {centerSubLabel && <Text style={styles.centerSubLabel}>{centerSubLabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  centerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  centerSubLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
