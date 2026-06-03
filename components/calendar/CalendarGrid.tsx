// components/calendar/CalendarGrid.tsx
// 日历网格组件

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';

interface CalendarGridProps {
  year: number;
  month: number; // 0-11
  selectedDate?: string; // YYYY-MM-DD
  markedDates?: string[]; // 有记录的日期
  onDatePress?: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 日历网格组件
 */
export function CalendarGrid({
  year,
  month,
  selectedDate,
  markedDates = [],
  onDatePress,
  onMonthChange,
}: CalendarGridProps) {
  const { t } = useI18n();

  // 获取月份天数
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // 获取月份第一天是星期几
  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
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

  // 上个月
  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange?.(year - 1, 11);
    } else {
      onMonthChange?.(year, month - 1);
    }
  };

  // 下个月
  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange?.(year + 1, 0);
    } else {
      onMonthChange?.(year, month + 1);
    }
  };

  // 渲染日历网格
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // 填充上个月的空白
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // 渲染本月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const today = isToday(year, month, day);
      const selected = isSelected(year, month, day);
      const marked = isMarked(year, month, day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            today && styles.todayCell,
            selected && styles.selectedCell,
          ]}
          onPress={() => onDatePress?.(dateStr)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayText,
              today && styles.todayText,
              selected && styles.selectedText,
            ]}
          >
            {day}
          </Text>
          {marked && (
            <View style={[styles.dot, selected && styles.dotSelected]} />
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  // 月份名称
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ];

  return (
    <View style={styles.container}>
      {/* 月份导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {year}年{monthNames[month]}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 星期标题 */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
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
      <View style={styles.daysGrid}>{renderCalendarDays()}</View>
    </View>
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
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
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
});
