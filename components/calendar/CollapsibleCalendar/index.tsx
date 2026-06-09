// components/calendar/CollapsibleCalendar/index.tsx
// 主组件：组合 Header + MonthGrid + Knob + 列表 + 协调手势
// API: children 是 render-prop，父组件用 (scrollHandler/listPan/listRef) 自己渲染 FlatList

import React, { useCallback, useMemo, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated'
import { GestureDetector, type PanGesture } from 'react-native-gesture-handler'
import { theme } from '@/constants/theme'
import { CalendarHeader, HEADER_TOTAL_H } from './CalendarHeader'
import { MonthGrid, MONTH_GRID_H } from './MonthGrid'
import { DAY_CELL_H } from './DayCell'
import { useCollapseGesture } from './useCollapseGesture'
import type { CollapsibleCalendarProps, DateStr } from './types'

const KNOB_H = 24
const OPEN_H = HEADER_TOTAL_H + MONTH_GRID_H + KNOB_H
const CLOSED_H = HEADER_TOTAL_H + DAY_CELL_H + KNOB_H
const COLLAPSE_DELTA = MONTH_GRID_H - DAY_CELL_H // 220

// 默认 i18n
const DEFAULT_MONTH_NAMES_ZH = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
]
const DEFAULT_WEEKDAY_NAMES_ZH = ['日', '一', '二', '三', '四', '五', '六']

type ChildrenRenderProps = {
  scrollHandler: any
  listPan: PanGesture
  /** 把这个 ref 装到 Animated.FlatList 上 */
  scrollRef?: any
}

interface Props extends Omit<CollapsibleCalendarProps, 'children'> {
  children: (renderProps: ChildrenRenderProps) => React.ReactNode
}

const _todayStrLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getAdjustedFirstDay = (y: number, m: number, firstDay: number) => {
  const sunday0 = new Date(y, m, 1).getDay()
  return (sunday0 - firstDay + 7) % 7
}

export function CollapsibleCalendar({
  selectedDate,
  onDatePress,
  onMonthChange,
  markedDates,
  maxDate,
  firstDay = 1,
  monthNames = DEFAULT_MONTH_NAMES_ZH,
  weekDayNames,
  listRef,
  children,
}: Props) {
  // 当前显示的年月（独立于 selectedDate）—— 切月时变化
  const [{ year, month0 }, setYM] = useState(() => {
    const d = new Date(selectedDate)
    return { year: d.getFullYear(), month0: d.getMonth() }
  })

  const { expansion, calendarPan, listPan, scrollHandler } = useCollapseGesture({
    collapseDelta: COLLAPSE_DELTA,
  })

  // 选中日所在周（0-5）—— 折叠时把这一周拉到顶部
  const selectedRow = useMemo(() => {
    const d = new Date(selectedDate)
    if (d.getFullYear() !== year || d.getMonth() !== month0) return 0
    const offset = getAdjustedFirstDay(year, month0, firstDay)
    return Math.floor((offset + d.getDate() - 1) / 7)
  }, [selectedDate, year, month0, firstDay])

  // 标记日期 Set 化
  const markedSet = useMemo(() => {
    if (!markedDates) return new Set<DateStr>()
    return markedDates instanceof Set ? markedDates : new Set(markedDates)
  }, [markedDates])

  // 调整 weekDayNames 顺序
  const adjustedWeekDays = useMemo(() => {
    const src = weekDayNames ?? DEFAULT_WEEKDAY_NAMES_ZH
    return [...src.slice(firstDay), ...src.slice(0, firstDay)]
  }, [firstDay, weekDayNames])

  // 切月（包括邻月点击产生的隐式切月）
  const handleMonthChange = useCallback(
    (ny: number, nm: number) => {
      setYM({ year: ny, month0: nm })
      onMonthChange?.(ny, nm)
    },
    [onMonthChange]
  )

  // 用户点选日期：若跨月则自动切月
  const handleDatePress = useCallback(
    (date: DateStr) => {
      onDatePress(date)
      const d = new Date(date)
      if (d.getFullYear() !== year || d.getMonth() !== month0) {
        handleMonthChange(d.getFullYear(), d.getMonth())
      }
    },
    [year, month0, onDatePress, handleMonthChange]
  )

  // 父组件切换 selectedDate（外部 setState）时，若新日期不在当前月，自动切月
  React.useEffect(() => {
    const d = new Date(selectedDate)
    if (d.getFullYear() !== year || d.getMonth() !== month0) {
      setYM({ year: d.getFullYear(), month0: d.getMonth() })
    }
  }, [selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- 动画样式 ----------
  // 月历整体高度
  const calendarHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(expansion.value, [0, 1], [CLOSED_H, OPEN_H], Extrapolation.CLAMP),
  }))

  // gridClip 自己也跟随高度动画：折叠时只露一行（44），展开时全部 6 行（264）
  // 这样下方 Knob 在折叠态依然可见
  const gridClipHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(expansion.value, [0, 1], [DAY_CELL_H, MONTH_GRID_H], Extrapolation.CLAMP),
  }))

  // MonthGrid 整体上下平移：折叠态把选中周拉到第一行位置
  const gridTranslateStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          expansion.value,
          [0, 1],
          [-selectedRow * DAY_CELL_H, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }))

  // Knob 颜色淡化暗示可拖
  const knobStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 1], [0.6, 1], Extrapolation.CLAMP),
  }))

  // 切月按钮可用性
  const canGoNext = useMemo(() => {
    if (!maxDate) return true
    const nextFirst = new Date(year, month0 + 1, 1)
    const maxD = new Date(maxDate)
    return (
      nextFirst.getFullYear() < maxD.getFullYear() ||
      (nextFirst.getFullYear() === maxD.getFullYear() && nextFirst.getMonth() <= maxD.getMonth())
    )
  }, [year, month0, maxDate])

  return (
    <View style={styles.container}>
      {/* 月历区 */}
      <Animated.View style={[styles.calendar, calendarHeightStyle]}>
        <CalendarHeader
          year={year}
          month0={month0}
          monthNames={monthNames}
          weekDayNames={adjustedWeekDays}
          canGoNext={canGoNext}
          canGoPrev={true}
          onPrev={() =>
            handleMonthChange(month0 === 0 ? year - 1 : year, month0 === 0 ? 11 : month0 - 1)
          }
          onNext={() =>
            canGoNext &&
            handleMonthChange(month0 === 11 ? year + 1 : year, month0 === 11 ? 0 : month0 + 1)
          }
        />

        {/* MonthGrid clip 区 + Pan 手势 —— clip 高度动画，
            内部 translateY 把选中周拉到顶；折叠态视觉上只看到那一行 */}
        <GestureDetector gesture={calendarPan}>
          <Animated.View style={[styles.gridClip, gridClipHeightStyle]}>
            <Animated.View style={[styles.gridInner, gridTranslateStyle]}>
              <MonthGrid
                year={year}
                month0={month0}
                selectedDate={selectedDate}
                markedDates={markedSet}
                maxDate={maxDate}
                firstDay={firstDay}
                onDatePress={handleDatePress}
                onMonthChange={handleMonthChange}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* Knob 把手 */}
        <Animated.View style={[styles.knobContainer, knobStyle]}>
          <View style={styles.knob} />
        </Animated.View>
      </Animated.View>

      {/* 列表区 —— listPan 用 manualActivation 精确拦截，
          只在需要折叠/展开时才接管手势，其它情况让 FlatList native scroll 工作 */}
      <View style={styles.listContainer}>
        <GestureDetector gesture={listPan}>
          <Animated.View style={styles.listInner}>
            {children({ scrollHandler, listPan, scrollRef: listRef })}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  calendar: {
    backgroundColor: theme.colors.background.primary,
    overflow: 'hidden',
  },
  gridClip: {
    // height 由 gridClipHeightStyle 动画提供
    overflow: 'hidden',
  },
  gridInner: {
    height: MONTH_GRID_H,
  },
  knobContainer: {
    height: KNOB_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border.main,
  },
  listContainer: {
    flex: 1,
  },
  listInner: {
    flex: 1,
  },
})

export { OPEN_H, CLOSED_H, COLLAPSE_DELTA }
