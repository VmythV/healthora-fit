// components/icons/ChartBarIcon.tsx
// 柱状图图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChartBarIconProps {
  size?: number;
  color?: string;
}

/**
 * 柱状图图标
 *
 * @example
 * ```tsx
 * <ChartBarIcon size={24} color="#10B981" />
 * ```
 */
export function ChartBarIcon({ size = 24, color = '#000000' }: ChartBarIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 柱子 */}
        <Path
          d="M4 20V14"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 20V10"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14 20V6"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19 20V4"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 基线 */}
        <Path
          d="M2 20H22"
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
