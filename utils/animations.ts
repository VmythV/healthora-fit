// utils/animations.ts
// 动画工具函数

import { Animated, Easing } from 'react-native';

/**
 * 创建淡入动画
 */
export function createFadeInAnimation(
  value: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
}

/**
 * 创建淡出动画
 */
export function createFadeOutAnimation(
  value: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
}

/**
 * 创建从下方滑入动画
 */
export function createSlideInUpAnimation(
  value: Animated.Value,
  distance: number = 50,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.back(1.5)),
    useNativeDriver: true,
  });
}

/**
 * 创建缩放动画
 */
export function createScaleAnimation(
  value: Animated.Value,
  toValue: number = 1,
  duration: number = 200,
  delay: number = 0
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    delay,
    easing: Easing.out(Easing.back(1.5)),
    useNativeDriver: true,
  });
}

/**
 * 创建弹簧动画
 */
export function createSpringAnimation(
  value: Animated.Value,
  toValue: number,
  config?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  }
): Animated.CompositeAnimation {
  return Animated.spring(value, {
    toValue,
    stiffness: config?.stiffness || 100,
    damping: config?.damping || 10,
    mass: config?.mass || 1,
    useNativeDriver: true,
  });
}

/**
 * 创建按钮点击动画
 */
export function createButtonPressAnimation(
  scaleValue: Animated.Value
): {
  onPressIn: () => void;
  onPressOut: () => void;
} {
  return {
    onPressIn: () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    },
    onPressOut: () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    },
  };
}

/**
 * 创建数字变化动画
 */
export function createNumberAnimation(
  fromValue: number,
  toValue: number,
  duration: number = 500,
  onUpdate: (value: number) => void
): Animated.CompositeAnimation {
  const animatedValue = new Animated.Value(fromValue);

  animatedValue.addListener(({ value }) => {
    onUpdate(Math.round(value * 10) / 10);
  });

  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false,
  });
}

/**
 * 创建循环动画
 */
export function createLoopAnimation(
  animation: Animated.CompositeAnimation
): Animated.CompositeAnimation {
  return Animated.loop(animation);
}

/**
 * 创建序列动画
 */
export function createSequenceAnimation(
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
  return Animated.sequence(animations);
}

/**
 * 创建并行动画
 */
export function createParallelAnimation(
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
  return Animated.parallel(animations);
}

/**
 * 创建延迟动画
 */
export function createDelayAnimation(
  delay: number
): Animated.CompositeAnimation {
  return Animated.delay(delay);
}
