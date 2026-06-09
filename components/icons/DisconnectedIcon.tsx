// components/icons/DisconnectedIcon.tsx
// 未连接图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

interface DisconnectedIconProps {
  size?: number
  color?: string
}

/**
 * 未连接图标（空心圆）
 *
 * @example
 * ```tsx
 * <DisconnectedIcon size={24} color="#9CA3AF" />
 * ```
 */
export function DisconnectedIcon({ size = 24, color = '#9CA3AF' }: DisconnectedIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 外圈 */}
        <Circle
          cx="12"
          cy="12"
          r="9"
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
