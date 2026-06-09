// components/icons/InfoIcon.tsx
// 信息图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

interface InfoIconProps {
  size?: number
  color?: string
}

/**
 * 信息图标
 *
 * @example
 * ```tsx
 * <InfoIcon size={24} color="#3B82F6" />
 * ```
 */
export function InfoIcon({ size = 24, color = '#000000' }: InfoIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
        <Path
          d="M12 16V12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 8H12.01"
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
