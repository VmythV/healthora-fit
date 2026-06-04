// app/(tabs)/calendar.tsx
// 日志页面 - 滑动折叠月历为周视图

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

const COLLAPSE_RANGE = 150; // 过渡区间
const HEADER_BASE = 56;
const MONTH_NAV_H = 40;
const WEEKDAY_H = 22;
const GRID_ROW_H = 44;
const PADDING = 16;
// 6行完整月历的格子区高度
const FULL_GRID_H = 6 * GRID_ROW_H;
// 折叠后 1 行
const COLLAPSED_GRID_H = GRID_ROW_H;
// 日历总高（格子 + 头部）
const CAL_HEADER_H = MONTH_NAV_H + WEEKDAY_H + 8;

export default function CalendarScreen() {
  const { t } = useI18n();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  // 由滚动驱动的折叠进度（0=展开, 1=折叠）
  const collapseProgress = useSharedValue(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 选中日期在网格中的行号（0-5）
  const selectedRow = useMemo(() => {
    const d = new Date(selectedDate);
    if (d.getFullYear() !== year || d.getMonth() !== month) return 0;
    const firstDay = new Date(year, month, 1).getDay();
    return Math.floor((firstDay + d.getDate() - 1) / 7);
  }, [selectedDate, year, month]);

  // 测量日历头部实际高度
  const [calHeaderMeasured, setCalHeaderMeasured] = useState(CAL_HEADER_H);
  const [fullCalH, setFullCalH] = useState(calHeaderMeasured + FULL_GRID_H + PADDING * 2);

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

  // === 滚动驱动折叠 ===
  const scrollY = useSharedValue(0);

  const updateCollapsed = useCallback((v: boolean) => {
    setIsCollapsed(v);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const prog = Math.min(1, Math.max(0, event.contentOffset.y / COLLAPSE_RANGE));
      collapseProgress.value = prog;
      runOnJS(updateCollapsed)(prog >= 1);
    },
  });

  // 日历容器高度：展开全高 → 折叠后只有头部+1行
  const calendarHeightStyle = useAnimatedStyle(() => {
    const gridH = interpolate(
      collapseProgress.value,
      [0, 1],
      [FULL_GRID_H, COLLAPSED_GRID_H],
      Extrapolation.CLAMP
    );
    const totalH = PADDING + calHeaderMeasured + gridH + PADDING;
    return { height: totalH };
  });

  // 网格内容向上平移，让选中周行在缩小后的窗口内可见
  const calendarInnerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      collapseProgress.value,
      [0, 1],
      [0, -selectedRow * GRID_ROW_H],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 日历顶部位置
  const [calTop, setCalTop] = useState(HEADER_BASE);

  const onCalLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && collapseProgress.value < 1) {
      setFullCalH(h + 12);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题栏 */}
      <View
        style={styles.header}
        onLayout={(e) => {
          const bottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
          setCalTop(bottom + theme.spacing.sm);
        }}
      >
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* 日历 - 绝对定位，高度随滚动平滑缩小 */}
      <Animated.View
        style={[styles.calendarFloat, { top: calTop }, calendarHeightStyle]}
        onLayout={onCalLayout}
      >
        <Animated.View style={calendarInnerStyle}>
          <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            markedDates={markedDates}
            maxDate={todayStr}
            onDatePress={handleDatePress}
            onMonthChange={handleMonthChange}
            onHeaderLayout={(h: number) => {
              if (h > 0 && h !== calHeaderMeasured) setCalHeaderMeasured(h);
            }}
          />
        </Animated.View>
      </Animated.View>

      {/* 外层滚动 - 折叠后禁止滚动 */}
      <Animated.ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        scrollEnabled={!isCollapsed}
        contentContainerStyle={{ paddingTop: fullCalH }}
      >
        <DayDetail date={selectedDate} maxDate={todayStr} />
        <View style={{ height: 40 }} />
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
    zIndex: 20,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  calendarFloat: {
    position: 'absolute',
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
