// app/(tabs)/calendar.tsx
// 日志页面 - 月历 + 日详情

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CalendarGrid, DayDetail } from '@/components/calendar';

export default function CalendarScreen() {
  const { t } = useI18n();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

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

  // 点击日期
  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      <View style={styles.content}>
        {/* 月历 */}
        <CalendarGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          markedDates={markedDates}
          maxDate={todayStr}
          onDatePress={handleDatePress}
          onMonthChange={handleMonthChange}
        />

        {/* 当日详情 */}
        <DayDetail
          date={selectedDate}
          maxDate={todayStr}
        />
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
});
