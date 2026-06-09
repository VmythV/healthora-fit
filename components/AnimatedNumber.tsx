// components/AnimatedNumber.tsx
// 动画数字组件

import React, { useEffect, useRef, useState } from 'react'
import { Text, StyleSheet, Animated, TextStyle } from 'react-native'
import { theme } from '@/constants/theme'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  style?: TextStyle
  animateOnMount?: boolean
}

export function AnimatedNumber({
  value,
  duration = 500,
  decimals = 0,
  suffix = '',
  prefix = '',
  style,
  animateOnMount = true,
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current
  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : value)

  useEffect(() => {
    if (animateOnMount) {
      // 初始动画
      animatedValue.addListener(({ value: val }) => {
        setDisplayValue(Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals))
      })

      Animated.timing(animatedValue, {
        toValue: value,
        duration,
        useNativeDriver: false,
      }).start()

      return () => {
        animatedValue.removeAllListeners()
      }
    } else {
      setDisplayValue(value)
    }
  }, [value])

  return (
    <Text style={[styles.text, style]}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </Text>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
})
