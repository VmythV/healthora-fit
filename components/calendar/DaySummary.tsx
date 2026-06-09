// components/calendar/DaySummary.tsx
// 日期标签 + 三宫格统计（摄入 / 消耗 / 净值）
// 作为 AgendaList 的 ListHeaderComponent 使用

import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { useDietRecords } from '@/hooks/useDietRecords'
import { useExerciseRecords } from '@/hooks/useExerciseRecords'

interface DaySummaryProps {
  date: string
}

export function DaySummary({ date }: DaySummaryProps) {
  const { t } = useI18n()

  const { records: dietRecords } = useDietRecords(date)
  const { records: exerciseRecords } = useExerciseRecords(date)

  // 统计
  const { totalCalories, totalExerciseCalories, netCalories } = useMemo(() => {
    const cal = dietRecords.reduce((sum, r) => sum + (r.totalCalories || 0), 0)
    const exerciseCal = exerciseRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0)
    return {
      totalCalories: cal,
      totalExerciseCalories: exerciseCal,
      netCalories: cal - exerciseCal,
    }
  }, [dietRecords, exerciseRecords])

  // 日期标签：今天 / 昨天 / 具体日期
  const dateLabel = useMemo(() => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return t('common.today')
    if (d.toDateString() === yesterday.toDateString()) return t('common.yesterday')
    return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  }, [date, t])

  return (
    <View style={styles.container}>
      <Text style={styles.dateLabel}>{dateLabel}</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardIn]}>
          <Text style={styles.statLabel}>{t('calendar.caloriesIn')}</Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>{totalCalories}</Text>
            <Text style={styles.statUnit}>{t('home.kcal')}</Text>
          </View>
        </View>
        <View style={[styles.statCard, styles.statCardOut]}>
          <Text style={styles.statLabel}>{t('calendar.caloriesOut')}</Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.colors.primary.main }]}>
              {totalExerciseCalories}
            </Text>
            <Text style={styles.statUnit}>{t('home.kcal')}</Text>
          </View>
        </View>
        <View style={[styles.statCard, styles.statCardNet]}>
          <Text style={styles.statLabel}>{t('calendar.caloriesNet')}</Text>
          <View style={styles.statValueRow}>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    netCalories > 0
                      ? theme.colors.warning
                      : netCalories < 0
                        ? theme.colors.primary.main
                        : theme.colors.text.secondary,
                },
              ]}
            >
              {netCalories > 0 ? `+${netCalories}` : netCalories}
            </Text>
            <Text style={styles.statUnit}>{t('home.kcal')}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  dateLabel: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    borderLeftWidth: 3,
  },
  statCardIn: {
    borderLeftColor: theme.colors.warning,
  },
  statCardOut: {
    borderLeftColor: theme.colors.primary.main,
  },
  statCardNet: {
    borderLeftColor: theme.colors.border.main,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statValue: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.bold,
  },
  statUnit: {
    fontSize: theme.fontSize.tiny,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.medium,
  },
})
