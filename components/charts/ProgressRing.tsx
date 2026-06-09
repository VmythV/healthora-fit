// components/charts/ProgressRing.tsx
// 进度环组件

import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { theme } from '@/constants/theme'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showLabel?: boolean
  label?: string
  animated?: boolean
  duration?: number
}

/**
 * 进度环组件
 *
 * @example
 * ```tsx
 * // 基础用法
 * <ProgressRing progress={75} />
 *
 * // 自定义样式
 * <ProgressRing
 *   progress={60}
 *   size={120}
 *   strokeWidth={12}
 *   color="#10B981"
 *   label="目标进度"
 * />
 *
 * // 带动画
 * <ProgressRing
 *   progress={80}
 *   animated
 *   duration={1000}
 * />
 * ```
 */
export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 10,
  color = theme.colors.primary.main,
  backgroundColor = theme.colors.background.tertiary,
  showLabel = true,
  label,
  animated = true,
  duration = 1000,
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current

  // 计算圆的属性
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // 限制进度范围
  const clampedProgress = Math.min(100, Math.max(0, progress))

  // 动画效果
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clampedProgress,
        useNativeDriver: false,
        duration,
      }).start()
    } else {
      animatedValue.setValue(clampedProgress)
    }
  }, [clampedProgress, animated, duration])

  // 计算进度
  const strokeDashoffset = circumference - (circumference * clampedProgress) / 100

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* 背景圆 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* 进度圆 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>

      {/* 标签 */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.progressText}>{Math.round(clampedProgress)}%</Text>
          {label && <Text style={styles.labelText}>{label}</Text>}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  labelText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
})
