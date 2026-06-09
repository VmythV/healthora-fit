// components/calendar/CollapsibleCalendar/useCollapseGesture.ts
// NestedScroll 协调 hook
// - 月历区 Pan：直接驱动 expansion（折叠/展开）
// - 列表区滚动：onScroll 写 scrollY
// - 列表区 Pan：manualActivation 精确控制 —— 只在
//   "上拉且月历未完全折叠" 或 "下拉到顶且月历未完全展开" 时拦截，
//   其它情况完全让位给 FlatList native scroll

import { useMemo } from 'react'
import {
  useSharedValue,
  useAnimatedScrollHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture } from 'react-native-gesture-handler'

interface UseCollapseGestureOpts {
  /** 折叠所需的"虚拟位移" px。建议 = MONTH_GRID_H - DAY_CELL_H = 5*44 = 220 */
  collapseDelta: number
  /** snap spring 配置 */
  spring?: { damping?: number; stiffness?: number; mass?: number }
  /** 折叠状态变化回调（同步反馈给 JS 层） */
  onExpansionChange?: (expansion: number) => void
}

const clamp = (v: number, lo: number, hi: number) => {
  'worklet'
  return Math.max(lo, Math.min(hi, v))
}

// 激活阈值（手指必须移动至少这么多才考虑拦截）
const ACTIVATE_TOUCH_SLOP = 8

export function useCollapseGesture({
  collapseDelta,
  spring = { damping: 18, stiffness: 180, mass: 0.6 },
  onExpansionChange,
}: UseCollapseGestureOpts) {
  const expansion = useSharedValue(1)
  const scrollY = useSharedValue(0)
  const panStartExpansion = useSharedValue(1)
  const panStartTouchY = useSharedValue(0)
  const lastReported = useSharedValue(1)

  const snapToNearest = (curr: number) => {
    'worklet'
    const target = curr > 0.5 ? 1 : 0
    expansion.value = withSpring(target, spring, () => {
      if (onExpansionChange && lastReported.value !== target) {
        lastReported.value = target
        runOnJS(onExpansionChange)(target)
      }
    })
  }

  // 1. 月历区 Pan —— 直接驱动 expansion（无需协调，月历区不和别的滚动冲突）
  const calendarPan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .failOffsetX([-15, 15])
        .onStart(() => {
          'worklet'
          panStartExpansion.value = expansion.value
        })
        .onUpdate((e) => {
          'worklet'
          expansion.value = clamp(panStartExpansion.value + e.translationY / collapseDelta, 0, 1)
        })
        .onEnd(() => {
          'worklet'
          snapToNearest(expansion.value)
        }),
    [collapseDelta, expansion, panStartExpansion]
  )

  // 2. 列表 onScroll —— 只写 scrollY
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
    },
  })

  // 3. 列表区 Pan —— manualActivation 精确拦截
  //    默认不激活（让 FlatList native scroll 自然工作）
  //    检测到需要拦截（折叠/展开）时 manager.activate() 才接管
  const listPan = useMemo(
    () =>
      Gesture.Pan()
        .manualActivation(true)
        .onTouchesDown((e) => {
          'worklet'
          if (e.changedTouches.length > 0) {
            panStartTouchY.value = e.changedTouches[0].y
            panStartExpansion.value = expansion.value
          }
        })
        .onTouchesMove((e, manager) => {
          'worklet'
          if (e.changedTouches.length < 1) return
          const dy = e.changedTouches[0].y - panStartTouchY.value
          if (Math.abs(dy) < ACTIVATE_TOUCH_SLOP) return
          const atTop = scrollY.value <= 0
          // 上拉 + 月历未完全折叠 → 接管驱动折叠
          if (dy < 0 && expansion.value > 0) {
            manager.activate()
          }
          // 下拉到顶 + 月历未完全展开 → 接管驱动展开
          else if (dy > 0 && atTop && expansion.value < 1) {
            manager.activate()
          }
          // 其它：什么都不做，让 native scroll 自然 work
        })
        .onUpdate((e) => {
          'worklet'
          const dy = e.translationY
          const atTop = scrollY.value <= 0
          if (dy < 0 && expansion.value > 0) {
            expansion.value = clamp(panStartExpansion.value + dy / collapseDelta, 0, 1)
          } else if (dy > 0 && atTop && expansion.value < 1) {
            expansion.value = clamp(panStartExpansion.value + dy / collapseDelta, 0, 1)
          }
        })
        .onEnd(() => {
          'worklet'
          if (expansion.value > 0 && expansion.value < 1) {
            snapToNearest(expansion.value)
          }
        }),
    [collapseDelta, expansion, scrollY, panStartExpansion, panStartTouchY]
  )

  return {
    expansion,
    scrollY,
    calendarPan,
    listPan,
    scrollHandler,
  }
}
