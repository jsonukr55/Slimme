import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', disabled, loading, style, icon }: ButtonProps) {
  const bgColor = {
    primary: Colors.primary,
    secondary: Colors.accent,
    outline: 'transparent',
    danger: Colors.error,
  }[variant];

  const textColor = variant === 'outline' ? Colors.primary : '#FFFFFF';
  const borderColor = variant === 'outline' ? Colors.primary : 'transparent';

  const paddingV = { sm: 8, md: 12, lg: 16 }[size];
  const fontSize = { sm: 14, md: 16, lg: 18 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.border : bgColor,
          paddingVertical: paddingV,
          borderColor: disabled ? Colors.border : borderColor,
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor, fontSize, marginLeft: icon ? 8 : 0 }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
