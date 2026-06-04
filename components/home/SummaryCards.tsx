// components/home/SummaryCards.tsx
// 今日摘要卡片

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';

interface SummaryCardsProps {
  weight?: number;
  weightChange?: number;
  targetWeight?: number;
  mealsCount: number;
  totalCalories: number;
  exerciseMinutes: number;
  caloriesBurned: number;
}

/**
 * 今日摘要卡片
 */
export function SummaryCards({
  weight,
  weightChange,
  targetWeight,
  mealsCount,
  totalCalories,
  exerciseMinutes,
  caloriesBurned,
}: SummaryCardsProps) {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      {/* 体重卡片 */}
      <Card style={styles.weightCard}>
        <View style={styles.cardIcon}>
          <Icon name="weight" size={24} color={theme.colors.primary.main} />
        </View>
        <Text style={styles.cardTitle}>{t('home.weight')}</Text>
        <Text style={styles.cardValue}>
          {weight ? weight.toFixed(1) : '--'}
        </Text>
        <Text style={styles.cardUnit}>{t('home.kg')}</Text>
        {weightChange !== undefined && (
          <Text
            style={[
              styles.changeText,
              weightChange > 0 ? styles.changeUp : weightChange < 0 ? styles.changeDown : styles.changeSame,
            ]}
          >
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
          </Text>
        )}
      </Card>

      {/* 饮食卡片 */}
      <Card style={styles.dietCard}>
        <View style={styles.cardIcon}>
          <Icon name="bowl" size={24} color={theme.colors.primary.main} />
        </View>
        <Text style={styles.cardTitle}>{t('home.meals')}</Text>
        <Text style={styles.cardValue}>{mealsCount}</Text>
        <Text style={styles.cardUnit}>{t('diet.calories')}</Text>
        <Text style={styles.cardExtra}>{totalCalories} {t('home.kcal')}</Text>
      </Card>

      {/* 运动卡片 */}
      <Card style={styles.exerciseCard}>
        <View style={styles.cardIcon}>
          <Icon name="exercise" size={24} color={theme.colors.primary.main} />
        </View>
        <Text style={styles.cardTitle}>{t('home.exercise')}</Text>
        <Text style={styles.cardValue}>{exerciseMinutes}</Text>
        <Text style={styles.cardUnit}>{t('home.minutes')}</Text>
        <View style={styles.cardExtraContainer}>
          <Icon name="fire" size={14} color={theme.colors.primary.main} />
          <Text style={styles.cardExtra}>{caloriesBurned} {t('home.kcal')}</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  weightCard: {
    flex: 1,
    padding: theme.spacing.base,
    alignItems: 'center',
  },
  dietCard: {
    flex: 1,
    padding: theme.spacing.base,
    alignItems: 'center',
  },
  exerciseCard: {
    flex: 1,
    padding: theme.spacing.base,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  cardValue: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  cardUnit: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  cardExtraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cardExtra: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.primary.main,
    marginLeft: theme.spacing.xs,
  },
  changeText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  changeUp: {
    color: theme.colors.error,
  },
  changeDown: {
    color: theme.colors.success,
  },
  changeSame: {
    color: theme.colors.text.tertiary,
  },
});
