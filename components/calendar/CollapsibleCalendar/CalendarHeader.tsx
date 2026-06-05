// components/calendar/CollapsibleCalendar/CalendarHeader.tsx
// 月份导航 + 星期标题
// 注意：高度需要稳定（用于 CollapsibleCalendar 计算 open/close height）

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

export const HEADER_NAV_H = 44;
export const HEADER_WEEKDAY_H = 26;
export const HEADER_TOTAL_H = HEADER_NAV_H + HEADER_WEEKDAY_H;

interface Props {
  year: number;
  month0: number; // 0-11
  monthNames: string[];
  weekDayNames: string[]; // 已按 firstDay 调整顺序
  canGoNext: boolean;
  canGoPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function CalendarHeaderImpl({
  year,
  month0,
  monthNames,
  weekDayNames,
  canGoNext,
  canGoPrev,
  onPrev,
  onNext,
}: Props) {
  return (
    <View style={styles.container}>
      {/* 月份导航 */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={onPrev}
          disabled={!canGoPrev}
          style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.navText, !canGoPrev && styles.navTextDisabled]}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {year}年{monthNames[month0]}
        </Text>

        <TouchableOpacity
          onPress={onNext}
          disabled={!canGoNext}
          style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.navText, !canGoNext && styles.navTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 星期标题 */}
      <View style={styles.weekdayRow}>
        {weekDayNames.map((d, i) => (
          <View key={i} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const CalendarHeader = memo(CalendarHeaderImpl);

const styles = StyleSheet.create({
  container: {
    height: HEADER_TOTAL_H,
  },
  navRow: {
    height: HEADER_NAV_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.light,
    lineHeight: 30,
  },
  navTextDisabled: {
    color: theme.colors.text.tertiary,
  },
  monthTitle: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  weekdayRow: {
    height: HEADER_WEEKDAY_H,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.base,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.tertiary,
  },
});
