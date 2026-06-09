// components/icons/TipsIcon.tsx
// 提示图标（灯泡）

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface TipsIconProps {
  size?: number
  color?: string
}

/**
 * 提示图标（灯泡）
 *
 * @example
 * ```tsx
 * <TipsIcon size={24} color="#F59E0B" />
 * ```
 */
export function TipsIcon({ size = 24, color = '#000000' }: TipsIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 灯泡 */}
        <Path
          d="M9 18H15M10 22H14M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
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
