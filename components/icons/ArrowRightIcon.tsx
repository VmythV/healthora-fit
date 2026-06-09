// components/icons/ArrowRightIcon.tsx
// 右箭头图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface ArrowRightIconProps {
  size?: number
  color?: string
}

/**
 * 右箭头图标
 *
 * @example
 * ```tsx
 * <ArrowRightIcon size={24} color="#6B7280" />
 * ```
 */
export function ArrowRightIcon({ size = 24, color = '#000000' }: ArrowRightIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 12H19M19 12L12 5M19 12L12 19"
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
