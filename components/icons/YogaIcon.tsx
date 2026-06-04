// components/icons/YogaIcon.tsx
// 瑜伽图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface YogaIconProps {
  size?: number;
  color?: string;
}

/**
 * 瑜伽图标
 *
 * @example
 * ```tsx
 * <YogaIcon size={24} color="#10B981" />
 * ```
 */
export function YogaIcon({ size = 24, color = '#000000' }: YogaIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 头部 */}
        <Circle
          cx="12"
          cy="4"
          r="2"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 身体 */}
        <Path
          d="M12 6V12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 左腿 */}
        <Path
          d="M8 20L12 12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右腿 */}
        <Path
          d="M16 20L12 12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 左臂 */}
        <Path
          d="M4 10L12 6"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右臂 */}
        <Path
          d="M20 10L12 6"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
