import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { getRelativeDay, parseDate, addDays, getDateKey } from '@/lib/date-utils';

interface DateSelectorProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const goBack = () => {
    const d = parseDate(date);
    onDateChange(getDateKey(addDays(d, -1)));
  };

  const goForward = () => {
    const d = parseDate(date);
    const next = addDays(d, 1);
    const nextKey = getDateKey(next);
    if (nextKey <= getDateKey()) {
      onDateChange(nextKey);
    }
  };

  const isToday = date === getDateKey();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={goBack} style={styles.arrow}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDateChange(getDateKey())} style={styles.dateContainer}>
        <Text style={styles.dateText}>{getRelativeDay(date)}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goForward} style={styles.arrow} disabled={isToday}>
        <Ionicons name="chevron-forward" size={24} color={isToday ? Colors.textLight : Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  arrow: {
    padding: Spacing.sm,
  },
  dateContainer: {
    paddingHorizontal: Spacing.lg,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
});
