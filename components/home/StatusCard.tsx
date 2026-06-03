// components/home/StatusCard.tsx
// 今日状态评分卡片

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/ui';

interface StatusCardProps {
  score: number; // 0-100
}

/**
 * 今日状态评分卡片
 */
export function StatusCard({ score }: StatusCardProps) {
  const { t } = useI18n();

  // 计算星级（1-5星）
  const stars = Math.round(score / 20);
  const starIcons = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

  // 获取状态文字
  const getStatusText = () => {
    if (score >= 90) return t('home.statusExcellent');
    if (score >= 70) return t('home.statusGood');
    if (score >= 50) return t('home.statusAverage');
    return t('home.statusPoor');
  };

  // 获取状态颜色
  const getStatusColor = () => {
    if (score >= 90) return theme.colors.success;
    if (score >= 70) return theme.colors.primary.main;
    if (score >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{t('home.todayStatus')}</Text>
      <Text style={styles.stars}>{starIcons}</Text>
      <Text style={[styles.status, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreUnit}>/100</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  stars: {
    fontSize: 28,
    letterSpacing: 4,
  },
  status: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: theme.spacing.sm,
  },
  scoreValue: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  scoreUnit: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs,
  },
});
