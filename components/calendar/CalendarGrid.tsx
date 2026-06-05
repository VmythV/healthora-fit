// components/calendar/CalendarGrid.tsx
// 日历网格组件

import React, { useCallback, useMemo, useState } from 'react';
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
  withTiming,
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
  onHeaderLayout?: (height: number) => void; // 回调测量头部高度
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
  onHeaderLayout,
}: CalendarGridProps) {
  const { t } = useI18n();
  const { getWeekDays, getAdjustedFirstDay } = useWeekStartDay();

  // 动画值
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  // 测量容器宽度（用于切月动画的位移幅度）
  const [containerW, setContainerW] = useState(320);

  // 判断是否可以跳转到下个月（必须在 handleNextMonth 之前定义）
  const canGoNextMonth = useCallback(() => {
    if (!maxDate) return true;
    const maxDateObj = new Date(maxDate);
    const nextMonth = new Date(year, month + 1, 1);
    return nextMonth.getFullYear() < maxDateObj.getFullYear() ||
           (nextMonth.getFullYear() === maxDateObj.getFullYear() &&
            nextMonth.getMonth() <= maxDateObj.getMonth());
  }, [year, month, maxDate]);

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

  // 按钮点击切月：复用滑入滑出动画
  const animateToNextMonth = useCallback(() => {
    if (!canGoNextMonth()) return;
    const w = containerW;
    translateX.value = withTiming(-w, { duration: 180 }, (finished) => {
      'worklet';
      if (!finished) return;
      runOnJS(handleNextMonth)();
      translateX.value = w;
      translateX.value = withTiming(0, { duration: 200 });
    });
  }, [containerW, handleNextMonth, canGoNextMonth, translateX]);

  const animateToPrevMonth = useCallback(() => {
    const w = containerW;
    translateX.value = withTiming(w, { duration: 180 }, (finished) => {
      'worklet';
      if (!finished) return;
      runOnJS(handlePrevMonth)();
      translateX.value = -w;
      translateX.value = withTiming(0, { duration: 200 });
    });
  }, [containerW, handlePrevMonth, translateX]);

  // 滑动手势 —— 主轴判定避免误触：水平超 10px 才接管，竖向超 10px 直接失败让 ScrollView 接管
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      // 阻尼 0.6 跟手感更紧；最大位移 60px
      const maxTranslation = 60;
      const clampedTranslation = Math.max(
        -maxTranslation,
        Math.min(maxTranslation, event.translationX * 0.6)
      );
      translateX.value = clampedTranslation;
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      const threshold = 60; // 提升阈值降低误触
      const w = containerW;
      if (event.translationX < -threshold) {
        // 向左滑动 → 切下个月：当前月滑出 → setState → 新月从右侧滑入
        translateX.value = withTiming(-w, { duration: 180 }, (finished) => {
          if (!finished) return;
          runOnJS(handleNextMonth)();
          translateX.value = w;
          translateX.value = withTiming(0, { duration: 200 });
        });
      } else if (event.translationX > threshold) {
        translateX.value = withTiming(w, { duration: 180 }, (finished) => {
          if (!finished) return;
          runOnJS(handlePrevMonth)();
          translateX.value = -w;
          translateX.value = withTiming(0, { duration: 200 });
        });
      } else {
        // 未达阈值：平滑回弹
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
          mass: 0.5,
        });
      }
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
              // 邻月日期一步到位：父组件会自动同步 year/month
              onDatePress?.(dateStr);
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
              // 邻月日期一步到位：父组件会自动同步 year/month
              onDatePress?.(dateStr);
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
      <Animated.View
        style={[styles.container, animatedStyle]}
        onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
      >
        {/* 月份导航 + 星期标题（测量高度） */}
        <View
          onLayout={(e) => onHeaderLayout?.(e.nativeEvent.layout.height)}>
        <View style={styles.header}>
          <TouchableOpacity onPress={animateToPrevMonth} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {year}年{monthNames[month]}
          </Text>
          <TouchableOpacity
            onPress={animateToNextMonth}
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
        </View>

        {/* 日期网格 */}
        <View style={styles.daysGrid}>
          {calendarDays}
        </View>
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
    position: 'relative',
  },
  dayText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  todayCell: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },
  todayText: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.bold,
  },
  selectedCell: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
    borderWidth: 0,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.bold,
  },
  // 「有记录」角标：右上角小圆点（既不挡数字，也在选中态下清晰可见）
  dot: {
    position: 'absolute',
    top: 6,
    right: 10,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.primary.main,
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
  },
  disabledCell: {
    opacity: 0.35,
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  otherMonthDay: {
    // 邻月使用纯灰文字而不是透明度，与当月低对比明显区分
  },
  otherMonthText: {
    color: '#9CA3AF', // gray-400，比 text.tertiary 更弱
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navTextDisabled: {
    color: theme.colors.text.tertiary,
  },
});
