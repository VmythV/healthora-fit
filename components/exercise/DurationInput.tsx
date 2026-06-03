// components/exercise/DurationInput.tsx
// 运动时长输入

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';

interface DurationInputProps {
  value: number; // 分钟
  onChange: (minutes: number) => void;
}

const PRESETS = [15, 30, 45, 60, 90, 120];

/**
 * 运动时长输入
 */
export function DurationInput({ value, onChange }: DurationInputProps) {
  const { t } = useI18n();

  const handleIncrement = (delta: number) => {
    const newValue = Math.max(1, value + delta);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {/* 数值调节 */}
      <View style={styles.adjuster}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleIncrement(-5)}
        >
          <Text style={styles.adjustButtonText}>-5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleIncrement(-1)}
        >
          <Text style={styles.adjustButtonText}>-1</Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{t('exercise.minutes')}</Text>
        </View>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleIncrement(1)}
        >
          <Text style={styles.adjustButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleIncrement(5)}
        >
          <Text style={styles.adjustButtonText}>+5</Text>
        </TouchableOpacity>
      </View>

      {/* 预设值 */}
      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              value === preset && styles.presetButtonActive,
            ]}
            onPress={() => onChange(preset)}
          >
            <Text
              style={[
                styles.presetText,
                value === preset && styles.presetTextActive,
              ]}
            >
              {preset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.base,
  },
  adjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  value: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  unit: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  presetButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
  },
  presetButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  presetText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
});
