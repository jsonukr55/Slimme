import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  style?: ViewStyle;
  suffix?: string;
}

export function Input({ label, value, onChangeText, placeholder, keyboardType, multiline, style, suffix }: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          keyboardType={keyboardType}
          multiline={multiline}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  suffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
});
