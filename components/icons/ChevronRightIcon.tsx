// components/icons/ChevronRightIcon.tsx
// 右尖角图标 - 列表项跳转指示

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface ChevronRightIconProps {
  size?: number
  color?: string
}

/**
 * 右尖角图标
 *
 * @example
 * ```tsx
 * <ChevronRightIcon size={16} color="#9CA3AF" />
 * ```
 */
export function ChevronRightIcon({ size = 24, color = '#000000' }: ChevronRightIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 6L15 12L9 18"
          stroke={color}
          strokeWidth={2}
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
