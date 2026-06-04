// components/weight/WeightInput.tsx
// 体重输入组件

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Icon } from '@/components/icons';
import { TrendUpIcon, TrendDownIcon, TrendFlatIcon } from '@/components/icons';

interface WeightInputProps {
  value: number; // kg
  onChange: (weight: number) => void;
  lastWeight?: number;
  targetWeight?: number;
}

/**
 * 体重输入组件
 */
export function WeightInput({
  value,
  onChange,
  lastWeight,
  targetWeight,
}: WeightInputProps) {
  const { t } = useI18n();

  const handleIncrement = (delta: number) => {
    const newValue = Math.max(20, Math.min(300, value + delta));
    onChange(Math.round(newValue * 10) / 10);
  };

  // 计算与上次的差距
  const lastDiff = lastWeight ? value - lastWeight : null;
  // 计算与目标的差距
  const targetDiff = targetWeight ? value - targetWeight : null;

  return (
    <View style={styles.container}>
      {/* 主输入区域 */}
      <View style={styles.mainInput}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleIncrement(-1)}
        >
          <Text style={styles.adjustButtonText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButtonSmall}
          onPress={() => handleIncrement(-0.1)}
        >
          <Text style={styles.adjustButtonText}>-.1</Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value.toFixed(1)}</Text>
          <Text style={styles.unit}>{t('weight.kg')}</Text>
        </View>

        <TouchableOpacity
          style={styles.adjustButtonSmall}
          onPress={() => handleIncrement(0.1)}
        >
          <Text style={styles.adjustButtonText}>+.1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleIncrement(1)}
        >
          <Text style={styles.adjustButtonText}>+1</Text>
        </TouchableOpacity>
      </View>

      {/* 信息卡片 */}
      <View style={styles.infoRow}>
        {/* 上次记录 */}
        {lastWeight && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('weight.lastRecord')}</Text>
            <Text style={styles.infoValue}>{lastWeight.toFixed(1)} {t('weight.kg')}</Text>
            {lastDiff !== null && (
              <View style={styles.diffRow}>
                {lastDiff > 0
                  ? <TrendUpIcon size={14} color={theme.colors.error} />
                  : lastDiff < 0
                  ? <TrendDownIcon size={14} color={theme.colors.success} />
                  : <TrendFlatIcon size={14} color={theme.colors.text.tertiary} />
                }
                <Text
                  style={[
                    styles.infoDiff,
                    lastDiff > 0 ? styles.diffUp : lastDiff < 0 ? styles.diffDown : styles.diffSame,
                  ]}
                >
                  {Math.abs(lastDiff).toFixed(1)} {t('weight.kg')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 目标体重 */}
        {targetWeight && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('weight.targetWeight')}</Text>
            <Text style={styles.infoValue}>{targetWeight.toFixed(1)} {t('weight.kg')}</Text>
            {targetDiff !== null && (
              <View style={styles.diffRow}>
                {targetDiff > 0
                  ? <TrendUpIcon size={14} color={theme.colors.error} />
                  : targetDiff < 0
                  ? <TrendDownIcon size={14} color={theme.colors.success} />
                  : <TrendFlatIcon size={14} color={theme.colors.text.tertiary} />
                }
                <Text
                  style={[
                    styles.infoDiff,
                    targetDiff > 0 ? styles.diffUp : targetDiff < 0 ? styles.diffDown : styles.diffSame,
                  ]}
                >
                  {Math.abs(targetDiff).toFixed(1)} {t('weight.kg')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  mainInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  adjustButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  value: {
    fontSize: 56,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  unit: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: 4,
  },
  infoDiff: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
  },
  diffUp: {
    color: theme.colors.error,
  },
  diffDown: {
    color: theme.colors.success,
  },
  diffSame: {
    color: theme.colors.text.tertiary,
  },
});
