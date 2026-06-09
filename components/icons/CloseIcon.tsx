// components/icons/CloseIcon.tsx
// 关闭图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface CloseIconProps {
  size?: number
  color?: string
}

/**
 * 关闭图标
 *
 * @example
 * ```tsx
 * <CloseIcon size={24} color="#6B7280" />
 * ```
 */
export function CloseIcon({ size = 24, color = '#000000' }: CloseIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 6L6 18M6 6L18 18"
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
