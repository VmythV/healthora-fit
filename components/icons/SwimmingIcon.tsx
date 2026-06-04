// components/icons/SwimmingIcon.tsx
// 游泳图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SwimmingIconProps {
  size?: number;
  color?: string;
}

/**
 * 游泳图标
 *
 * @example
 * ```tsx
 * <SwimmingIcon size={24} color="#10B981" />
 * ```
 */
export function SwimmingIcon({ size = 24, color = '#000000' }: SwimmingIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 头部 */}
        <Path
          d="M16 4C17.1 4 18 4.9 18 6C18 7.1 17.1 8 16 8C14.9 8 14 7.1 14 6C14 4.9 14.9 4 16 4Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 身体 */}
        <Path
          d="M8 12L16 8L20 10"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 左臂 */}
        <Path
          d="M8 12L4 8"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右臂 */}
        <Path
          d="M8 12L12 16"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 水波 */}
        <Path
          d="M2 16C4 14 6 16 8 14C10 12 12 14 14 12C16 10 18 12 20 10"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2 20C4 18 6 20 8 18C10 16 12 18 14 16C16 14 18 16 20 14"
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
