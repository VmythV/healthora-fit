// components/exercise/ExerciseTypeSelector.tsx
// 运动类型选择器

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';

interface ExerciseTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

const EXERCISE_TYPES: { key: string; icon: IconName }[] = [
  { key: 'running', icon: 'running' },
  { key: 'walking', icon: 'walking' },
  { key: 'cycling', icon: 'cycling' },
  { key: 'swimming', icon: 'swimming' },
  { key: 'strength', icon: 'strength' },
  { key: 'yoga', icon: 'yoga' },
  { key: 'hiit', icon: 'hiit' },
  { key: 'other', icon: 'other-exercise' },
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
          <View style={styles.iconContainer}>
            <Icon name={type.icon} size={28} color={value === type.key ? theme.colors.primary.main : theme.colors.text.secondary} />
          </View>
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
  iconContainer: {
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
