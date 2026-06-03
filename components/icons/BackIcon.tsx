// components/icons/BackIcon.tsx
// 返回图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BackIconProps {
  size?: number;
  color?: string;
}

/**
 * 返回图标（左箭头）
 *
 * @example
 * ```tsx
 * <BackIcon size={24} color="#10B981" />
 * ```
 */
export function BackIcon({ size = 24, color = '#000000' }: BackIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M19 12H5M5 12L12 19M5 12L12 5"
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
