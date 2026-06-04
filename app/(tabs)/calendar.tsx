// app/(tabs)/calendar.tsx
// 日历页面

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CalendarGrid, DayView } from '@/components/calendar';

type ViewMode = 'month' | 'day';

export default function CalendarScreen() {
  const { t } = useI18n();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // 按月查询有记录的日期
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  useEffect(() => {
    loadMarkedDates();
  }, [year, month]);

  const loadMarkedDates = async () => {
    try {
      const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const [dietDates, exerciseDates] = await Promise.all([
        dietQueries.getDatesWithRecords(monthStart, monthEnd),
        exerciseQueries.getDatesWithRecords(monthStart, monthEnd),
      ]);

      setMarkedDates([...new Set([...dietDates, ...exerciseDates])]);
    } catch (err) {
      logger.error('[Calendar] 加载标记日期失败:', err);
    }
  };

  // 月份切换
  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  // 日期选择
  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
    setViewMode('day');
  }, []);

  // 日期切换（日视图）
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'month' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('month')}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'month' && styles.toggleTextActive,
              ]}
            >
              {t('calendar.monthView')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'day' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('day')}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'day' && styles.toggleTextActive,
              ]}
            >
              {t('calendar.dayView')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 内容 */}
      <View style={styles.content}>
        {viewMode === 'month' ? (
          <View style={styles.monthView}>
            <CalendarGrid
              year={year}
              month={month}
              selectedDate={selectedDate}
              markedDates={markedDates}
              maxDate={todayStr}
              onDatePress={handleDatePress}
              onMonthChange={handleMonthChange}
            />
          </View>
        ) : (
          <DayView
            date={selectedDate}
            maxDate={todayStr}
            onDateChange={handleDateChange}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  toggleText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  monthView: {
    flex: 1,
  },
});
