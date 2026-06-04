// components/icons/RunningIcon.tsx
// 跑步图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface RunningIconProps {
  size?: number;
  color?: string;
}

/**
 * 跑步图标
 *
 * @example
 * ```tsx
 * <RunningIcon size={24} color="#10B981" />
 * ```
 */
export function RunningIcon({ size = 24, color = '#000000' }: RunningIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 头部 */}
        <Circle
          cx="14"
          cy="4"
          r="2"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 身体 */}
        <Path
          d="M10 8L14 6L16 8L14 12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 左腿 */}
        <Path
          d="M10 16L14 12L10 20"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右腿 */}
        <Path
          d="M18 16L14 12L18 20"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 左臂 */}
        <Path
          d="M6 10L10 8L8 14"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右臂 */}
        <Path
          d="M16 8L18 4"
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
