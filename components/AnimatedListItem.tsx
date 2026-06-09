// components/AnimatedListItem.tsx
// 动画列表项组件

import React, { useEffect, useRef } from 'react'
import { StyleSheet, Animated, TouchableOpacity, ViewStyle } from 'react-native'
import { theme } from '@/constants/theme'

interface AnimatedListItemProps {
  children: React.ReactNode
  index?: number
  style?: ViewStyle
  onPress?: () => void
  onLongPress?: () => void
  animationType?: 'fadeIn' | 'slideUp' | 'slideIn'
}

export function AnimatedListItem({
  children,
  index = 0,
  style,
  onPress,
  onLongPress,
  animationType = 'fadeIn',
}: AnimatedListItemProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(-20)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    const delay = index * 50 // 每个列表项延迟 50ms

    switch (animationType) {
      case 'fadeIn':
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }).start()
        break

      case 'slideUp':
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
        ]).start()
        break

      case 'slideIn':
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
        ]).start()
        break
    }
  }, [])

  const animatedStyle = {
    opacity,
    transform: [
      { translateX: animationType === 'slideIn' ? translateX : 0 },
      { translateY: animationType === 'slideUp' ? translateY : 0 },
    ],
  }

  const content = (
    <Animated.View style={[styles.item, animatedStyle, style]}>{children}</Animated.View>
  )

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
})
