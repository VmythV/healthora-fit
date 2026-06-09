// components/TimeRangeSelector.tsx
// 时间范围选择器组件

import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'

export type TimeRangeType = 'week' | 'month' | 'year'

export interface DateRange {
  startDate: string
  endDate: string
  label: string
}

interface TimeRangeSelectorProps {
  onRangeChange: (range: DateRange) => void
  initialType?: TimeRangeType
}

/**
 * 获取本周的日期范围
 */
function getWeekRange(weekOffset: number = 0): DateRange {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1 + weekOffset * 7)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]
  const formatLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
    label:
      weekOffset === 0
        ? '本周'
        : weekOffset === -1
          ? '上周'
          : `${formatLabel(monday)} - ${formatLabel(sunday)}`,
  }
}

/**
 * 获取本月的日期范围
 */
function getMonthRange(monthOffset: number = 0): DateRange {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + monthOffset

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
    label: monthOffset === 0 ? '本月' : monthOffset === -1 ? '上月' : `${month + 1}月`,
  }
}

/**
 * 获取本年的日期范围
 */
function getYearRange(yearOffset: number = 0): DateRange {
  const now = new Date()
  const year = now.getFullYear() + yearOffset

  const firstDay = new Date(year, 0, 1)
  const lastDay = new Date(year, 11, 31)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
    label: yearOffset === 0 ? '今年' : yearOffset === -1 ? '去年' : `${year}年`,
  }
}

export function TimeRangeSelector({ onRangeChange, initialType = 'week' }: TimeRangeSelectorProps) {
  const { t } = useI18n()
  const [rangeType, setRangeType] = useState<TimeRangeType>(initialType)
  const [offset, setOffset] = useState(0)

  // 计算当前日期范围
  const currentRange = useMemo(() => {
    switch (rangeType) {
      case 'week':
        return getWeekRange(offset)
      case 'month':
        return getMonthRange(offset)
      case 'year':
        return getYearRange(offset)
    }
  }, [rangeType, offset])

  // 切换类型时重置偏移
  const handleTypeChange = (type: TimeRangeType) => {
    setRangeType(type)
    setOffset(0)
    const range =
      type === 'week' ? getWeekRange(0) : type === 'month' ? getMonthRange(0) : getYearRange(0)
    onRangeChange(range)
  }

  // 前进/后退
  const handlePrev = () => {
    const newOffset = offset - 1
    setOffset(newOffset)
    const range =
      rangeType === 'week'
        ? getWeekRange(newOffset)
        : rangeType === 'month'
          ? getMonthRange(newOffset)
          : getYearRange(newOffset)
    onRangeChange(range)
  }

  const handleNext = () => {
    if (offset >= 0) return // 不能超过当前时间
    const newOffset = offset + 1
    setOffset(newOffset)
    const range =
      rangeType === 'week'
        ? getWeekRange(newOffset)
        : rangeType === 'month'
          ? getMonthRange(newOffset)
          : getYearRange(newOffset)
    onRangeChange(range)
  }

  // 重置到当前
  const handleReset = () => {
    setOffset(0)
    const range =
      rangeType === 'week'
        ? getWeekRange(0)
        : rangeType === 'month'
          ? getMonthRange(0)
          : getYearRange(0)
    onRangeChange(range)
  }

  // 初始化时触发
  React.useEffect(() => {
    onRangeChange(currentRange)
  }, [])

  return (
    <View style={styles.container}>
      {/* 类型选择 */}
      <View style={styles.typeSelector}>
        {(['week', 'month', 'year'] as TimeRangeType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, rangeType === type && styles.typeButtonActive]}
            onPress={() => handleTypeChange(type)}
          >
            <Text
              style={[styles.typeButtonText, rangeType === type && styles.typeButtonTextActive]}
            >
              {t(`analysis.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 日期范围导航 */}
      <View style={styles.rangeNavigator}>
        <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReset} style={styles.rangeLabel}>
          <Text style={styles.rangeLabelText}>{currentRange.label}</Text>
          {offset !== 0 && <Text style={styles.resetHint}>点击回到当前</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.navButton, offset >= 0 && styles.navButtonDisabled]}
          disabled={offset >= 0}
        >
          <Text style={[styles.navButtonText, offset >= 0 && styles.navButtonTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 日期范围显示 */}
      <Text style={styles.dateRange}>
        {currentRange.startDate} ~ {currentRange.endDate}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
    padding: 4,
    marginBottom: theme.spacing.base,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  typeButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
  rangeNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.background.secondary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
  navButtonTextDisabled: {
    color: theme.colors.text.tertiary,
  },
  rangeLabel: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  rangeLabelText: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  resetHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.primary.main,
    marginTop: 2,
  },
  dateRange: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
})
