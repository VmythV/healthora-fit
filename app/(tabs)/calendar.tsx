// app/(tabs)/calendar.tsx
// 日志页面 - 可折叠月历 + 日详情

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CalendarGrid, DayDetail } from '@/components/calendar';

const COLLAPSE_THRESHOLD = 120; // 滑动多少 px 后完全折叠
const FULL_HEIGHT = 340;  // 月历展开高度
const COLLAPSED_HEIGHT = 82; // 折叠后仅显示星期标题的高度

export default function CalendarScreen() {
  const { t } = useI18n();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  // 折叠状态（由滚动位置计算）
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

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

  // 滚动驱动折叠
  const scrollY = useSharedValue(0);

  const updateCollapsed = useCallback((v: boolean) => {
    setCalendarCollapsed(v);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      runOnJS(updateCollapsed)(event.contentOffset.y > COLLAPSE_THRESHOLD);
    },
  });

  // 日历容器动画样式
  const calendarAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, COLLAPSE_THRESHOLD],
      [FULL_HEIGHT, COLLAPSED_HEIGHT],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, COLLAPSE_THRESHOLD],
      [1, 0.95],
      Extrapolation.CLAMP
    );
    return { height, opacity };
  });

  // 日期导航动画（折叠时显示）
  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, COLLAPSE_THRESHOLD / 2],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* 月历 - 随滚动折叠 */}
      <Animated.View style={[styles.calendarWrapper, calendarAnimatedStyle]}>
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
      </Animated.View>

      {/* 折叠后悬浮的选中日期 */}
      <Animated.View style={[styles.collapsedBar, collapsedHeaderStyle]} pointerEvents="none">
        <Text style={styles.collapsedDate} numberOfLines={1}>
          {(() => {
            const d = new Date(selectedDate);
            const today = new Date();
            if (d.toDateString() === today.toDateString()) return t('common.today');
            return `${d.getMonth() + 1}月${d.getDate()}日`;
          })()}
        </Text>
      </Animated.View>

      {/* 日详情 - 可滚动 */}
      <Animated.ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <DayDetail
          date={selectedDate}
          maxDate={todayStr}
        />
      </Animated.ScrollView>
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
  calendarWrapper: {
    overflow: 'hidden',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  collapsedBar: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 4,
    backgroundColor: theme.colors.background.secondary,
  },
  collapsedDate: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
