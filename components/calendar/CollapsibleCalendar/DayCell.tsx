// components/calendar/CollapsibleCalendar/DayCell.tsx
// 单日单元格（月视图 + 周视图共用）

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

export const DAY_CELL_H = 44;

interface Props {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isMarked: boolean;
  isOtherMonth: boolean;
  isFuture: boolean;
  onPress: () => void;
}

function DayCellImpl({
  day,
  isToday,
  isSelected,
  isMarked,
  isOtherMonth,
  isFuture,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.cell}
      onPress={isFuture ? undefined : onPress}
      activeOpacity={isFuture ? 1 : 0.7}
      disabled={isFuture}
    >
      <View
        style={[
          styles.indicator,
          isToday && !isSelected && styles.todayIndicator,
          isSelected && styles.selectedIndicator,
        ]}
      >
        <Text
          style={[
            styles.text,
            isOtherMonth && styles.otherMonthText,
            isFuture && styles.futureText,
            isToday && !isSelected && styles.todayText,
            isSelected && styles.selectedText,
          ]}
        >
          {day}
        </Text>
      </View>
      {/* 右上角小角标：有记录但未选中（选中态吞掉 dot 容易看不清，挪到右上角） */}
      {isMarked && !isOtherMonth && !isFuture && (
        <View
          style={[
            styles.dot,
            isSelected && styles.dotSelected,
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

export const DayCell = memo(DayCellImpl);

const styles = StyleSheet.create({
  cell: {
    width: `${100 / 7}%`,
    height: DAY_CELL_H,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayIndicator: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },
  selectedIndicator: {
    backgroundColor: theme.colors.primary.main,
  },
  text: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  todayText: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.bold,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.bold,
  },
  otherMonthText: {
    color: '#9CA3AF',
  },
  futureText: {
    color: theme.colors.text.tertiary,
    opacity: 0.5,
  },
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
});
