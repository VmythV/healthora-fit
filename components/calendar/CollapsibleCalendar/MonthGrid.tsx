// components/calendar/CollapsibleCalendar/MonthGrid.tsx
// 月视图网格 - 固定 6 行 7 列 + 横滑切月动画

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';
import { DayCell, DAY_CELL_H } from './DayCell';
import type { DateStr } from './types';

export const MONTH_ROWS = 6;
export const MONTH_GRID_H = MONTH_ROWS * DAY_CELL_H; // 264

interface Props {
  year: number;
  month0: number;
  selectedDate: DateStr;
  markedDates: Set<DateStr>;
  maxDate?: DateStr;
  firstDay: number; // 0=Sunday
  onDatePress: (date: DateStr) => void;
  onMonthChange: (year: number, month0: number) => void;
}

// 工具：YYYY-MM-DD 格式
const fmt = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

const getAdjustedFirstDay = (y: number, m: number, firstDay: number) => {
  const sunday0 = new Date(y, m, 1).getDay(); // 0-6
  return (sunday0 - firstDay + 7) % 7;
};

export function MonthGrid({
  year,
  month0,
  selectedDate,
  markedDates,
  maxDate,
  firstDay,
  onDatePress,
  onMonthChange,
}: Props) {
  const { width: screenW } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const todayStr = useMemo(() => {
    const d = new Date();
    return fmt(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  // 月份变化时手势位置归零
  const [animKey, setAnimKey] = useState(0);

  // 检查是否可切月
  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    const nextFirst = new Date(year, month0 + 1, 1);
    const maxD = new Date(maxDate);
    return (
      nextFirst.getFullYear() < maxD.getFullYear() ||
      (nextFirst.getFullYear() === maxD.getFullYear() &&
        nextFirst.getMonth() <= maxD.getMonth())
    );
  }, [year, month0, maxDate]);

  // 切月：用滑入滑出动画
  const goNext = useCallback(() => {
    if (!canGoNext) return;
    const ny = month0 === 11 ? year + 1 : year;
    const nm = month0 === 11 ? 0 : month0 + 1;
    onMonthChange(ny, nm);
  }, [year, month0, canGoNext, onMonthChange]);

  const goPrev = useCallback(() => {
    const ny = month0 === 0 ? year - 1 : year;
    const nm = month0 === 0 ? 11 : month0 - 1;
    onMonthChange(ny, nm);
  }, [year, month0, onMonthChange]);

  // 横滑切月手势
  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-12, 12])
        .onUpdate((e) => {
          'worklet';
          // 阻尼 0.6，限制最大位移
          const damped = e.translationX * 0.6;
          translateX.value = Math.max(-80, Math.min(80, damped));
        })
        .onEnd((e) => {
          'worklet';
          const threshold = 60;
          if (e.translationX < -threshold) {
            // 向左 → 下个月
            translateX.value = withTiming(-screenW, { duration: 180 }, (finished) => {
              if (!finished) return;
              runOnJS(goNext)();
              translateX.value = screenW;
              translateX.value = withTiming(0, { duration: 200 });
            });
          } else if (e.translationX > threshold) {
            translateX.value = withTiming(screenW, { duration: 180 }, (finished) => {
              if (!finished) return;
              runOnJS(goPrev)();
              translateX.value = -screenW;
              translateX.value = withTiming(0, { duration: 200 });
            });
          } else {
            translateX.value = withTiming(0, { duration: 160 });
          }
        }),
    [screenW, goNext, goPrev, translateX]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 邻月日期点击：父组件 handleDatePress 会自动同步 month
  const handleDatePressInternal = useCallback(
    (date: DateStr) => {
      onDatePress(date);
    },
    [onDatePress]
  );

  // 渲染 42 个 cell（6 行 × 7 列）
  const cells = useMemo(() => {
    const arr: React.ReactNode[] = [];
    const firstOffset = getAdjustedFirstDay(year, month0, firstDay);
    const dim = daysInMonth(year, month0);

    // 上月填充
    const prevM = month0 === 0 ? 11 : month0 - 1;
    const prevY = month0 === 0 ? year - 1 : year;
    const prevDim = daysInMonth(prevY, prevM);
    for (let i = firstOffset - 1; i >= 0; i--) {
      const d = prevDim - i;
      const dateStr = fmt(prevY, prevM, d);
      const isFuture = maxDate ? dateStr > maxDate : false;
      arr.push(
        <DayCell
          key={`p-${d}`}
          day={d}
          isToday={dateStr === todayStr}
          isSelected={dateStr === selectedDate}
          isMarked={markedDates.has(dateStr)}
          isOtherMonth
          isFuture={isFuture}
          onPress={() => handleDatePressInternal(dateStr)}
        />
      );
    }

    // 本月
    for (let d = 1; d <= dim; d++) {
      const dateStr = fmt(year, month0, d);
      const isFuture = maxDate ? dateStr > maxDate : false;
      arr.push(
        <DayCell
          key={`c-${d}`}
          day={d}
          isToday={dateStr === todayStr}
          isSelected={dateStr === selectedDate}
          isMarked={markedDates.has(dateStr)}
          isOtherMonth={false}
          isFuture={isFuture}
          onPress={() => handleDatePressInternal(dateStr)}
        />
      );
    }

    // 下月填充
    const nextM = month0 === 11 ? 0 : month0 + 1;
    const nextY = month0 === 11 ? year + 1 : year;
    const remaining = 42 - arr.length;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = fmt(nextY, nextM, i);
      const isFuture = maxDate ? dateStr > maxDate : false;
      arr.push(
        <DayCell
          key={`n-${i}`}
          day={i}
          isToday={dateStr === todayStr}
          isSelected={dateStr === selectedDate}
          isMarked={markedDates.has(dateStr)}
          isOtherMonth
          isFuture={isFuture}
          onPress={() => handleDatePressInternal(dateStr)}
        />
      );
    }

    return arr;
  }, [
    year,
    month0,
    selectedDate,
    markedDates,
    maxDate,
    firstDay,
    todayStr,
    handleDatePressInternal,
  ]);

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.container, animStyle]}>
        {cells}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MONTH_GRID_H,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.sm,
  },
});
