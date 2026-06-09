// components/icons/AddIcon.tsx
// 添加图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface AddIconProps {
  size?: number
  color?: string
}

/**
 * 添加图标（加号）
 *
 * @example
 * ```tsx
 * <AddIcon size={24} color="#10B981" />
 * ```
 */
export function AddIcon({ size = 24, color = '#000000' }: AddIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 5V19M5 12H19"
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
