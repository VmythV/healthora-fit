// components/icons/AiIcon.tsx
// AI 图标（机器人）

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'

interface AiIconProps {
  size?: number
  color?: string
}

/**
 * AI 图标（机器人）
 *
 * @example
 * ```tsx
 * <AiIcon size={24} color="#10B981" />
 * ```
 */
export function AiIcon({ size = 24, color = '#000000' }: AiIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 天线 */}
        <Path
          d="M12 2V4"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8 4H16"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 头部 */}
        <Path
          d="M6 8C6 6.9 6.9 6 8 6H16C17.1 6 18 6.9 18 8V14C18 15.1 17.1 16 16 16H8C6.9 16 6 15.1 6 14V8Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 眼睛 */}
        <Circle cx="10" cy="10" r="1" fill={color} />
        <Circle cx="14" cy="10" r="1" fill={color} />
        {/* 嘴巴 */}
        <Path
          d="M10 13H14"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 身体 */}
        <Path
          d="M9 16V18H15V16"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 脚 */}
        <Path
          d="M8 18V20H10V18"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14 18V20H16V18"
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
