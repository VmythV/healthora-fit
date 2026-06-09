// components/icons/WeightIcon.tsx
// 体重图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

interface WeightIconProps {
  size?: number
  color?: string
}

/**
 * 体重图标（秤）
 *
 * @example
 * ```tsx
 * <WeightIcon size={24} color="#10B981" />
 * ```
 */
export function WeightIcon({ size = 24, color = '#000000' }: WeightIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={1.5} />
        <Path
          d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 11V15M10 13H14"
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
