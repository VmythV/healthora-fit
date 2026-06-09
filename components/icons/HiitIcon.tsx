// components/icons/HiitIcon.tsx
// HIIT 图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface HiitIconProps {
  size?: number
  color?: string
}

/**
 * HIIT 图标（闪电）
 *
 * @example
 * ```tsx
 * <HiitIcon size={24} color="#F59E0B" />
 * ```
 */
export function HiitIcon({ size = 24, color = '#000000' }: HiitIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
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
