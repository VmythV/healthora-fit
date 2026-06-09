// components/LoadingDots.tsx
// 加载动画组件

import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { theme } from '@/constants/theme'

interface LoadingDotsProps {
  size?: number
  color?: string
  count?: number
}

export function LoadingDots({
  size = 8,
  color = theme.colors.primary.main,
  count = 3,
}: LoadingDotsProps) {
  const animations = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current

  useEffect(() => {
    const createAnimation = (index: number) => {
      return Animated.sequence([
        Animated.delay(index * 150),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations[index], {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animations[index], {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ])
    }

    Animated.parallel(animations.map((_, i) => createAnimation(i))).start()
  }, [])

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {},
})
