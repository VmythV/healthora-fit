// components/icons/TrendFlatIcon.tsx
// 持平趋势图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TrendFlatIconProps {
  size?: number;
  color?: string;
}

/**
 * 持平趋势图标
 *
 * @example
 * ```tsx
 * <TrendFlatIcon size={24} color="#6B7280" />
 * ```
 */
export function TrendFlatIcon({ size = 24, color = '#000000' }: TrendFlatIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 横向箭头 */}
        <Path
          d="M5 12H19"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15 8L19 12L15 16"
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
