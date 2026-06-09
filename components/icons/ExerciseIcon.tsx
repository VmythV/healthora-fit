// components/icons/ExerciseIcon.tsx
// 运动图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface ExerciseIconProps {
  size?: number
  color?: string
}

/**
 * 运动图标（跑步的人）
 *
 * @example
 * ```tsx
 * <ExerciseIcon size={24} color="#10B981" />
 * ```
 */
export function ExerciseIcon({ size = 24, color = '#000000' }: ExerciseIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={5} r={2} stroke={color} strokeWidth={1.5} />
        <Path
          d="M10 22L8 16L10 12L14 10L16 12L18 16L16 22"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 12L6 14M14 10L18 8"
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
