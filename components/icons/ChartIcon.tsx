// components/icons/ChartIcon.tsx
// 分析图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface ChartIconProps {
  size?: number
  color?: string
}

/**
 * 分析图标（柱状图）
 *
 * @example
 * ```tsx
 * <ChartIcon size={24} color="#10B981" />
 * ```
 */
export function ChartIcon({ size = 24, color = '#000000' }: ChartIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 20V10M12 20V4M6 20V14"
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
