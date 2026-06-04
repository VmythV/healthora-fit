// components/icons/SunriseIcon.tsx
// 日出图标（早餐）

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface SunriseIconProps {
  size?: number;
  color?: string;
}

/**
 * 日出图标（早餐）
 *
 * @example
 * ```tsx
 * <SunriseIcon size={24} color="#F59E0B" />
 * ```
 */
export function SunriseIcon({ size = 24, color = '#000000' }: SunriseIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 太阳 */}
        <Circle
          cx="12"
          cy="12"
          r="4"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 光线 */}
        <Path
          d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 地平线 */}
        <Path
          d="M2 18H22"
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
