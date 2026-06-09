// components/icons/StarIcon.tsx
// 实心星星图标

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface StarIconProps {
  size?: number
  color?: string
}

/**
 * 实心星星图标
 *
 * @example
 * ```tsx
 * <StarIcon size={24} color="#F59E0B" />
 * ```
 */
export function StarIcon({ size = 24, color = '#F59E0B' }: StarIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
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
