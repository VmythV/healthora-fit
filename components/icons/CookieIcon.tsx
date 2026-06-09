// components/icons/CookieIcon.tsx
// 饼干图标（加餐）

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface CookieIconProps {
  size?: number
  color?: string
}

/**
 * 饼干图标（加餐）
 *
 * @example
 * ```tsx
 * <CookieIcon size={24} color="#D97706" />
 * ```
 */
export function CookieIcon({ size = 24, color = '#000000' }: CookieIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 饼干主体 */}
        <Path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 巧克力豆 */}
        <Circle cx="8" cy="10" r="1" fill={color} />
        <Circle cx="14" cy="8" r="1" fill={color} />
        <Circle cx="10" cy="14" r="1" fill={color} />
        <Circle cx="16" cy="13" r="1" fill={color} />
        <Circle cx="12" cy="18" r="1" fill={color} />
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
