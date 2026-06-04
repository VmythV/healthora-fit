// app/(tabs)/calendar.tsx
// 日志页面 - 可折叠月历 + 日详情

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CalendarGrid, DayDetail } from '@/components/calendar';

const COLLAPSE_THRESHOLD = 60;
const CALENDAR_FULL_HEIGHT = 340;
const CALENDAR_COLLAPSED_HEIGHT = 82;

export default function CalendarScreen() {
  const { t } = useI18n();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

  const scrollYRef = useRef(0);

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

  // 滚动时检测折叠状态
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollYRef.current = y;
    const shouldCollapse = y > COLLAPSE_THRESHOLD;
    if (shouldCollapse !== calendarCollapsed) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCalendarCollapsed(shouldCollapse);
    }
  }, [calendarCollapsed]);

  const calendarHeight = calendarCollapsed ? CALENDAR_COLLAPSED_HEIGHT : CALENDAR_FULL_HEIGHT;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* 月历 - 绝对定位浮在 ScrollView 上方 */}
      <View
        style={[styles.calendarFloat, { height: calendarHeight }]}
        pointerEvents="box-none"
      >
        <CalendarGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          markedDates={markedDates}
          maxDate={todayStr}
          onDatePress={handleDatePress}
          onMonthChange={handleMonthChange}
          collapsed={calendarCollapsed}
        />
      </View>

      {/* 内容区 - paddingTop 固定为月历全高，避免布局跳变 */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: CALENDAR_FULL_HEIGHT + 12 }}
      >
        <DayDetail
          date={selectedDate}
          maxDate={todayStr}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
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
    zIndex: 20,
  },
  calendarFloat: {
    position: 'absolute',
    top: 56,
    left: 12,
    right: 12,
    zIndex: 10,
    overflow: 'hidden',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
