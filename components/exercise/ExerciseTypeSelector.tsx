// components/exercise/ExerciseTypeSelector.tsx
// 运动类型选择器

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';

interface ExerciseTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

const EXERCISE_TYPES = [
  { key: 'running', icon: '🏃' },
  { key: 'walking', icon: '🚶' },
  { key: 'cycling', icon: '🚴' },
  { key: 'swimming', icon: '🏊' },
  { key: 'strength', icon: '💪' },
  { key: 'yoga', icon: '🧘' },
  { key: 'hiit', icon: '⚡' },
  { key: 'other', icon: '🎯' },
];

/**
 * 运动类型选择器
 */
export function ExerciseTypeSelector({ value, onChange }: ExerciseTypeSelectorProps) {
  const { t } = useI18n();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {EXERCISE_TYPES.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.item,
            value === type.key && styles.itemActive,
          ]}
          onPress={() => onChange(type.key)}
        >
          <Text style={styles.icon}>{type.icon}</Text>
          <Text
            style={[
              styles.label,
              value === type.key && styles.labelActive,
            ]}
          >
            {t(`exerciseType.${type.key}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  itemActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  icon: {
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  labelActive: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.semibold,
  },
});
