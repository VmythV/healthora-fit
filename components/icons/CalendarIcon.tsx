// components/icons/CalendarIcon.tsx
// 日历图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

interface CalendarIconProps {
  size?: number
  color?: string
}

/**
 * 日历图标
 *
 * @example
 * ```tsx
 * <CalendarIcon size={24} color="#10B981" />
 * ```
 */
export function CalendarIcon({ size = 24, color = '#000000' }: CalendarIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={1.5} />
        <Path
          d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
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
