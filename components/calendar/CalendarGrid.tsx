// components/calendar/CalendarGrid.tsx
// 日历网格组件

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useWeekStartDay } from '@/hooks/useWeekStartDay';

interface CalendarGridProps {
  year: number;
  month: number; // 0-11
  selectedDate?: string; // YYYY-MM-DD
  markedDates?: string[]; // 有记录的日期
  maxDate?: string; // YYYY-MM-DD，最大可选日期
  onDatePress?: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

// 星期标题将使用 getWeekDays() 动态生成

/**
 * 日历网格组件
 */
export function CalendarGrid({
  year,
  month,
  selectedDate,
  markedDates = [],
  maxDate,
  onDatePress,
  onMonthChange,
}: CalendarGridProps) {
  const { t } = useI18n();
  const { getWeekDays, getAdjustedFirstDay } = useWeekStartDay();

  // 动画值
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  // 上个月
  const handlePrevMonth = useCallback(() => {
    if (month === 0) {
      onMonthChange?.(year - 1, 11);
    } else {
      onMonthChange?.(year, month - 1);
    }
  }, [year, month, onMonthChange]);

  // 下个月
  const handleNextMonth = useCallback(() => {
    if (!canGoNextMonth()) return;
    if (month === 11) {
      onMonthChange?.(year + 1, 0);
    } else {
      onMonthChange?.(year, month + 1);
    }
  }, [year, month, onMonthChange, canGoNextMonth]);

  // 滑动手势
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      // 限制滑动幅度，最大为 30px
      const maxTranslation = 30;
      const clampedTranslation = Math.max(
        -maxTranslation,
        Math.min(maxTranslation, event.translationX * 0.3)
      );
      translateX.value = clampedTranslation;
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      const threshold = 20;
      if (event.translationX < -threshold) {
        // 向左滑动，切换到下个月
        runOnJS(handleNextMonth)();
      } else if (event.translationX > threshold) {
        // 向右滑动，切换到上个月
        runOnJS(handlePrevMonth)();
      }
      // 平滑回弹动画
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });
    });

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 获取月份天数
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // 获取月份第一天是星期几（调整后的）
  const getFirstDayOfMonth = (y: number, m: number) => {
    return getAdjustedFirstDay(y, m);
  };

  // 格式化日期
  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // 判断是否是今天
  const isToday = (y: number, m: number, d: number) => {
    const today = new Date();
    return (
      today.getFullYear() === y &&
      today.getMonth() === m &&
      today.getDate() === d
    );
  };

  // 判断是否被选中
  const isSelected = (y: number, m: number, d: number) => {
    return selectedDate === formatDate(y, m, d);
  };

  // 判断是否有记录
  const isMarked = (y: number, m: number, d: number) => {
    return markedDates.includes(formatDate(y, m, d));
  };

  // 判断是否是未来日期（超过最大日期）
  const isFutureDate = (y: number, m: number, d: number) => {
    if (!maxDate) return false;
    const dateStr = formatDate(y, m, d);
    return dateStr > maxDate;
  };

  // 判断是否可以跳转到下个月
  const canGoNextMonth = useCallback(() => {
    if (!maxDate) return true;
    const maxDateObj = new Date(maxDate);
    const nextMonth = new Date(year, month + 1, 1);
    return nextMonth.getFullYear() < maxDateObj.getFullYear() ||
           (nextMonth.getFullYear() === maxDateObj.getFullYear() &&
            nextMonth.getMonth() <= maxDateObj.getMonth());
  }, [year, month, maxDate]);

  // 计算实际行数
  const getActualRows = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const totalCells = firstDay + daysInMonth;
    return Math.ceil(totalCells / 7);
  };

  // 渲染日历网格（固定 6 行，填充上月/下月日期）- useMemo 优化切换月卡顿
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const TOTAL_ROWS = 6;
    const TOTAL_CELLS = TOTAL_ROWS * 7; // 6 行 × 7 列 = 42 个单元格

    // 计算上月末尾日期
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    // 填充上月日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = formatDate(prevYear, prevMonth, day);
      const future = isFutureDate(prevYear, prevMonth, day);

      days.push(
        <TouchableOpacity
          key={`prev-${day}`}
          style={[
            styles.dayCell,
            styles.otherMonthDay,
            future && styles.disabledCell,
          ]}
          onPress={() => {
            if (!future) {
              // 跳转到上个月
              handlePrevMonth();
              // 延迟选中日期
              setTimeout(() => onDatePress?.(dateStr), 100);
            }
          }}
          activeOpacity={future ? 1 : 0.7}
          disabled={future}
        >
          <Text
            style={[
              styles.dayText,
              styles.otherMonthText,
              future && styles.disabledText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // 渲染本月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const today = isToday(year, month, day);
      const selected = isSelected(year, month, day);
      const marked = isMarked(year, month, day);
      const future = isFutureDate(year, month, day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            today && styles.todayCell,
            selected && styles.selectedCell,
            future && styles.disabledCell,
          ]}
          onPress={() => !future && onDatePress?.(dateStr)}
          activeOpacity={future ? 1 : 0.7}
          disabled={future}
        >
          <Text
            style={[
              styles.dayText,
              today && styles.todayText,
              selected && styles.selectedText,
              future && styles.disabledText,
            ]}
          >
            {day}
          </Text>
          {marked && !future && (
            <View style={[styles.dot, selected && styles.dotSelected]} />
          )}
        </TouchableOpacity>
      );
    }

    // 计算下月开始日期
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingCells = TOTAL_CELLS - days.length;

    // 填充下月日期
    for (let i = 1; i <= remainingCells; i++) {
      const dateStr = formatDate(nextYear, nextMonth, i);
      const future = isFutureDate(nextYear, nextMonth, i);

      days.push(
        <TouchableOpacity
          key={`next-${i}`}
          style={[
            styles.dayCell,
            styles.otherMonthDay,
            future && styles.disabledCell,
          ]}
          onPress={() => {
            if (!future) {
              // 跳转到下个月
              handleNextMonth();
              // 延迟选中日期
              setTimeout(() => onDatePress?.(dateStr), 100);
            }
          }}
          activeOpacity={future ? 1 : 0.7}
          disabled={future}
        >
          <Text
            style={[
              styles.dayText,
              styles.otherMonthText,
              future && styles.disabledText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  }, [year, month, selectedDate, markedDates, maxDate, handlePrevMonth, handleNextMonth, onDatePress]);

  // 月份名称
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ];

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* 月份导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {year}年{monthNames[month]}
          </Text>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navButton, !canGoNextMonth() && styles.navButtonDisabled]}
            disabled={!canGoNextMonth()}
          >
            <Text style={[styles.navText, !canGoNextMonth() && styles.navTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 星期标题 */}
        <View style={styles.weekdayRow}>
          {getWeekDays().map((day, index) => (
            <View key={index} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayText,
                  (index === 0 || index === 6) && styles.weekendText,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* 日期网格 */}
        <View style={styles.daysGrid}>{calendarDays}</View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    ...theme.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  navText: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.light,
  },
  monthTitle: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  weekdayText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.tertiary,
  },
  weekendText: {
    color: theme.colors.error,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 6 * 44, // 固定 6 行高度，每行 44px
    alignContent: 'space-between', // 均匀分布行
  },
  dayCell: {
    width: '14.28%',
    height: 44, // 固定每行高度
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
  },
  dayText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  todayCell: {
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.full,
  },
  todayText: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.bold,
  },
  selectedCell: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.bold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary.main,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
  },
  disabledCell: {
    opacity: 0.4,
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthText: {
    color: theme.colors.text.tertiary,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navTextDisabled: {
    color: theme.colors.text.tertiary,
  },
});
