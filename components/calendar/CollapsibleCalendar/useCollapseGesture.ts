// components/calendar/CollapsibleCalendar/useCollapseGesture.ts
// NestedScroll 协调 hook
// - 月历区 Pan：直接驱动 expansion（折叠/展开）
// - 列表区滚动：onScroll 写 scrollY
// - 列表区 Pan（与 ScrollView 并发）：列表到顶下拉触发展开、上拉触发折叠

import { useMemo } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

interface UseCollapseGestureOpts {
  /** 折叠所需的"虚拟位移" px。建议 = MONTH_GRID_H - DAY_CELL_H = 5*44 = 220 */
  collapseDelta: number;
  /** snap spring 配置 */
  spring?: { damping?: number; stiffness?: number; mass?: number };
  /** 折叠状态变化回调（同步反馈给 JS 层） */
  onExpansionChange?: (expansion: number) => void;
}

const clamp = (v: number, lo: number, hi: number) => {
  'worklet';
  return Math.max(lo, Math.min(hi, v));
};

export function useCollapseGesture({
  collapseDelta,
  spring = { damping: 18, stiffness: 180, mass: 0.6 },
  onExpansionChange,
}: UseCollapseGestureOpts) {
  // expansion ∈ [0, 1]：0=折叠到单周, 1=完整月视图
  const expansion = useSharedValue(1);
  // list scrollY
  const scrollY = useSharedValue(0);
  // pan 起始 expansion 缓存
  const panStartExpansion = useSharedValue(1);
  // 上次报告给 JS 的 expansion（避免频繁 runOnJS）
  const lastReported = useSharedValue(1);

  // snap helper —— worklet 内部
  const snapToNearest = (curr: number) => {
    'worklet';
    const target = curr > 0.5 ? 1 : 0;
    expansion.value = withSpring(target, spring, () => {
      if (onExpansionChange && lastReported.value !== target) {
        lastReported.value = target;
        runOnJS(onExpansionChange)(target);
      }
    });
  };

  // 1. 月历区 Pan —— 直接驱动 expansion
  const calendarPan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .failOffsetX([-15, 15])
        .onStart(() => {
          'worklet';
          panStartExpansion.value = expansion.value;
        })
        .onUpdate((e) => {
          'worklet';
          // 上滑 dy<0 → 减小 expansion；下拉 dy>0 → 增大
          const next = clamp(
            panStartExpansion.value + e.translationY / collapseDelta,
            0,
            1
          );
          expansion.value = next;
        })
        .onEnd(() => {
          'worklet';
          snapToNearest(expansion.value);
        }),
    [collapseDelta, expansion, panStartExpansion]
  );

  // 2. 列表 onScroll —— 只写 scrollY
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // 3. 列表区 Pan —— 与 ScrollView 并发，按条件拦截：
  //    - expansion > 0 且上拉 → 拦截，驱动折叠
  //    - expansion < 1 且列表到顶 + 下拉 → 拦截，驱动展开
  //    - 否则不动 expansion，让 ScrollView 自己滚
  const listPan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-5, 5])
        .onStart(() => {
          'worklet';
          panStartExpansion.value = expansion.value;
        })
        .onUpdate((e) => {
          'worklet';
          const dy = e.translationY;
          const atTop = scrollY.value <= 0;
          // 上拉：折叠
          if (dy < 0 && expansion.value > 0) {
            expansion.value = clamp(
              panStartExpansion.value + dy / collapseDelta,
              0,
              1
            );
          }
          // 下拉到顶：展开
          else if (dy > 0 && atTop && expansion.value < 1) {
            expansion.value = clamp(
              panStartExpansion.value + dy / collapseDelta,
              0,
              1
            );
          }
        })
        .onEnd(() => {
          'worklet';
          if (expansion.value > 0 && expansion.value < 1) {
            snapToNearest(expansion.value);
          }
        }),
    [collapseDelta, expansion, scrollY, panStartExpansion]
  );

  return {
    expansion,
    scrollY,
    calendarPan,
    listPan,
    scrollHandler,
  };
}
