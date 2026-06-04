// components/icons/TrendUpIcon.tsx
// 上升趋势图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TrendUpIconProps {
  size?: number;
  color?: string;
}

/**
 * 上升趋势图标
 *
 * @example
 * ```tsx
 * <TrendUpIcon size={24} color="#EF4444" />
 * ```
 */
export function TrendUpIcon({ size = 24, color = '#000000' }: TrendUpIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 上升箭头 */}
        <Path
          d="M7 17L17 7"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 7H17V17"
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
