// app/(tabs)/calendar.tsx
// 日志页面 - 三区布局：日历(绝对定位) + 概括 + 时间线

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
  useAnimatedScrollHandler,
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
const CAL_TOP_GAP = 8;   // 标题栏与日历之间的间距（与 calTop 计算一致）
const CAL_BODY_GAP = 12; // 日历与概括之间保留的可见间距

export default function CalendarScreen() {
  const { t } = useI18n();
  const { getAdjustedFirstDay } = useWeekStartDay();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  const [calHeaderH, setCalHeaderH] = useState(60);
  const [calTop, setCalTop] = useState(60);
  const fullGridH = 6 * GRID_ROW_H;

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

  const timelineScrollY = useSharedValue(0);

  // 滚动驱动 —— 在 UI 线程直接回写 shared value，避免过桥掉帧
  const scrollHandler = useAnimatedScrollHandler((event) => {
    timelineScrollY.value = event.contentOffset.y;
  });

  // 折叠位移量：完整网格 → 单周
  const collapseDelta = fullGridH - GRID_ROW_H;
  const weekCalH = calHeaderH + GRID_ROW_H + PADDING;

  // 日历高度动画
  const calAnimatedStyle = useAnimatedStyle(() => {
    const gridH = interpolate(
      timelineScrollY.value,
      [0, fullGridH],
      [fullGridH, GRID_ROW_H],
      Extrapolation.CLAMP
    );
    return { height: calHeaderH + gridH + PADDING };
  });

  // 网格平移
  const calInnerStyle = useAnimatedStyle(() => {
    const progress = Math.min(1, timelineScrollY.value / fullGridH);
    return { transform: [{ translateY: -progress * selectedRow * GRID_ROW_H }] };
  });

  // body 位移动画 —— 用 transform 代替 paddingTop，避免每帧 relayout。
  // 初始下移 collapseDelta（位于完整日历下方），随折叠归零，
  // 让「概括」贴着日历底部一起上移，折叠到周后停住。
  const bodyAnimatedStyle = useAnimatedStyle(() => {
    const ty = interpolate(
      timelineScrollY.value,
      [0, fullGridH],
      [collapseDelta, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY: ty }] };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题栏 */}
      <View
        style={styles.header}
        onLayout={(e) => {
          setCalTop(e.nativeEvent.layout.y + e.nativeEvent.layout.height + CAL_TOP_GAP);
        }}
      >
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* 日历 - 绝对定位，高度变化不干扰布局 */}
      <Animated.View style={[styles.calFloat, { top: calTop }, calAnimatedStyle]}>
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

      {/* 概括 + 时间线 —— 固定 paddingTop=单周高度+间距，整体用 transform 下移/归位 */}
      <Animated.View style={[styles.bodyContainer, { paddingTop: weekCalH + CAL_TOP_GAP + CAL_BODY_GAP }, bodyAnimatedStyle]}>
        <DayDetail
          date={selectedDate}
          maxDate={todayStr}
          onScroll={scrollHandler}
          bottomSpacer={collapseDelta}
        />
      </Animated.View>
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
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  calFloat: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 10,
    overflow: 'hidden',
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
