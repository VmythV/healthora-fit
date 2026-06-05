// components/calendar/CollapsibleCalendar/types.ts
// CollapsibleCalendar 类型定义

import type { SharedValue } from 'react-native-reanimated';

/** YYYY-MM-DD */
export type DateStr = string;

/** 标记类型：当前简化版只支持 dot */
export interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
}

export type MarkedDates = Record<DateStr, MarkedDate>;

export interface CollapsibleCalendarProps {
  /** 当前选中日期 YYYY-MM-DD */
  selectedDate: DateStr;
  /** 用户点选日期回调 */
  onDatePress: (date: DateStr) => void;
  /** 当前显示的月份变化（横滑切月或邻月点击触发） */
  onMonthChange?: (year: number, month0: number) => void;
  /** 有记录的日期（YYYY-MM-DD 集合） */
  markedDates?: Set<DateStr> | DateStr[];
  /** 可选最大日期，超过的日期禁用点击 */
  maxDate?: DateStr;
  /** 星期开始日：0=Sunday, 1=Monday */
  firstDay?: number;
  /** 月份名（按 0-11 顺序），默认中文 */
  monthNames?: string[];
  /** 星期标题（按周日开头），默认中文短名 */
  weekDayNames?: string[];
  /** 暴露给父组件的列表 ref（用于 NestedScroll 协调） */
  listRef?: React.RefObject<any>;
  /** 子节点（通常是 FlatList / VirtualizedList） */
  children: React.ReactElement;
}

export interface CollapseState {
  /** 展开程度 0~1：0=单周折叠态, 1=完整月视图 */
  expansion: SharedValue<number>;
  /** 列表当前 scrollY（用于判断到顶） */
  scrollY: SharedValue<number>;
}
