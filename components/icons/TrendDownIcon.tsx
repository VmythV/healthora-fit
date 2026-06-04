// components/icons/TrendDownIcon.tsx
// 下降趋势图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TrendDownIconProps {
  size?: number;
  color?: string;
}

/**
 * 下降趋势图标
 *
 * @example
 * ```tsx
 * <TrendDownIcon size={24} color="#10B981" />
 * ```
 */
export function TrendDownIcon({ size = 24, color = '#000000' }: TrendDownIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 下降箭头 */}
        <Path
          d="M7 7L17 17"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17 7V17H7"
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
