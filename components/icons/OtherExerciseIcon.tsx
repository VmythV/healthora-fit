// components/icons/OtherExerciseIcon.tsx
// 其他运动图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface OtherExerciseIconProps {
  size?: number
  color?: string
}

/**
 * 其他运动图标（奖牌）
 *
 * @example
 * ```tsx
 * <OtherExerciseIcon size={24} color="#10B981" />
 * ```
 */
export function OtherExerciseIcon({ size = 24, color = '#000000' }: OtherExerciseIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 奖牌带子 */}
        <Path
          d="M8 2L6 8L12 10L18 8L16 2"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 奖牌 */}
        <Path
          d="M12 10C14.2 10 16 11.8 16 14C16 16.2 14.2 18 12 18C9.8 18 8 16.2 8 14C8 11.8 9.8 10 12 10Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 奖牌中心 */}
        <Path
          d="M10 14L11 15L14 12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
