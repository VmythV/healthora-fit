// components/AnimatedCard.tsx
// 动画卡片组件
//
// P1-15：从 RN 内置 Animated 迁到 Reanimated 4
// - 用 useSharedValue / useAnimatedStyle / withTiming / withSpring 替代旧 API
// - Props 不变，4 处使用点（app/(tabs)/index.tsx）零改动
// - 配合 React.memo 防止 props 相等时重渲染

import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated'
import { theme } from '@/constants/theme'

interface AnimatedCardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  delay?: number
  animationType?: 'fadeIn' | 'slideUp' | 'scale'
}

function AnimatedCardImpl({
  children,
  style,
  onPress,
  delay = 0,
  animationType = 'fadeIn',
}: AnimatedCardProps) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(animationType === 'slideUp' ? 30 : 0)
  const scale = useSharedValue(animationType === 'scale' ? 0.9 : 1)

  useEffect(() => {
    const opts = { duration: 300 }
    opacity.value = withDelay(delay, withTiming(1, opts))
    if (animationType === 'slideUp') {
      translateY.value = withDelay(delay, withTiming(0, opts))
    } else if (animationType === 'scale') {
      scale.value = withDelay(delay, withSpring(1))
    }
    // 注意：未调用 .value = X 在卸载时 reset，
    // Reanimated 4 + Fabric 自动清理 shared value，无需手动 stop
  }, [animationType, delay, opacity, translateY, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: animationType === 'slideUp' ? translateY.value : 0 },
      { scale: animationType === 'scale' ? scale.value : 1 },
    ],
  }))

  const content = (
    <Animated.View style={[styles.card, animatedStyle, style]}>{children}</Animated.View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

export const AnimatedCard = React.memo(AnimatedCardImpl)

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.sm,
  },
})
