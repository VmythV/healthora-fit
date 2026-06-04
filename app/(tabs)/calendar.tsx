// app/(tabs)/calendar.tsx
// 日志页面 - 三区布局：日历 → 概括 → 时间线

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CalendarGrid, DayDetail } from '@/components/calendar';
import { useWeekStartDay } from '@/hooks/useWeekStartDay';

const GRID_ROW_H = 44;
const PADDING = 16;

export default function CalendarScreen() {
  const { t } = useI18n();
  const { getAdjustedFirstDay } = useWeekStartDay();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  // 日历头部测量
  const [calHeaderH, setCalHeaderH] = useState(60);
  const fullGridH = 6 * GRID_ROW_H;
  const fullCalH = calHeaderH + fullGridH + PADDING; // 完整日历高度

  // 选中日期所在行
  const selectedRow = useMemo(() => {
    const d = new Date(selectedDate);
    if (d.getFullYear() !== year || d.getMonth() !== month) return 0;
    const firstDay = getAdjustedFirstDay(year, month);
    return Math.floor((firstDay + d.getDate() - 1) / 7);
  }, [selectedDate, year, month, getAdjustedFirstDay]);

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

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  // 时间线的滚动驱动日历折叠
  const timelineScrollY = useSharedValue(0);

  const handleTimelineScroll = useCallback((event: any) => {
    timelineScrollY.value = event.nativeEvent.contentOffset.y;
  }, [timelineScrollY]);

  // 日历容器：高度随 timeline 滚动缩小
  const calAnimatedStyle = useAnimatedStyle(() => {
    const gridH = interpolate(
      timelineScrollY.value,
      [0, fullGridH],
      [fullGridH, GRID_ROW_H],
      Extrapolation.CLAMP
    );
    return {
      height: calHeaderH + gridH + PADDING,
    };
  });

  // 网格平移：折叠时让选中行可见
  const calInnerStyle = useAnimatedStyle(() => {
    const progress = timelineScrollY.value / fullGridH;
    const clamped = Math.min(1, Math.max(0, progress));
    return {
      transform: [{ translateY: -clamped * selectedRow * GRID_ROW_H }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* ===== 第1部分：日历（随滚动折叠）===== */}
      <Animated.View style={[styles.calSection, calAnimatedStyle]}>
        <Animated.View style={calInnerStyle}>
          <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            markedDates={markedDates}
            maxDate={todayStr}
            onDatePress={handleDatePress}
            onMonthChange={handleMonthChange}
            onHeaderLayout={setCalHeaderH}
          />
        </Animated.View>
      </Animated.View>

      {/* ===== 第2部分：概括 + 可滚动时间线 ===== */}
      <DayDetail date={selectedDate} maxDate={todayStr} onScroll={handleTimelineScroll} />
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
  calSection: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
  },
});
