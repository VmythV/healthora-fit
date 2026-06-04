// components/icons/PlateIcon.tsx
// 餐盘图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface PlateIconProps {
  size?: number;
  color?: string;
}

/**
 * 餐盘图标
 *
 * @example
 * ```tsx
 * <PlateIcon size={24} color="#10B981" />
 * ```
 */
export function PlateIcon({ size = 24, color = '#000000' }: PlateIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 餐盘外圈 */}
        <Circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 餐盘内圈 */}
        <Circle
          cx="12"
          cy="12"
          r="6"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 餐盘中心 */}
        <Circle
          cx="12"
          cy="12"
          r="2"
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
