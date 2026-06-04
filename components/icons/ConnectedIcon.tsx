// components/icons/ConnectedIcon.tsx
// 已连接图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface ConnectedIconProps {
  size?: number;
  color?: string;
}

/**
 * 已连接图标（绿色圆点）
 *
 * @example
 * ```tsx
 * <ConnectedIcon size={24} color="#10B981" />
 * ```
 */
export function ConnectedIcon({ size = 24, color = '#10B981' }: ConnectedIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 外圈 */}
        <Circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 内圈（填充） */}
        <Circle
          cx="12"
          cy="12"
          r="5"
          fill={color}
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
