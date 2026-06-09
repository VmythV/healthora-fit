// components/icons/SettingsIcon.tsx
// 设置图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface SettingsIconProps {
  size?: number
  color?: string
}

/**
 * 设置图标（齿轮）
 *
 * @example
 * ```tsx
 * <SettingsIcon size={24} color="#10B981" />
 * ```
 */
export function SettingsIcon({ size = 24, color = '#000000' }: SettingsIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.5} />
        <Path
          d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
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
