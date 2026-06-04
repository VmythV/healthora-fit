// components/icons/BowlIcon.tsx
// 碗图标（餐食/米饭）

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BowlIconProps {
  size?: number;
  color?: string;
}

/**
 * 碗图标（餐食/米饭）
 *
 * @example
 * ```tsx
 * <BowlIcon size={24} color="#10B981" />
 * ```
 */
export function BowlIcon({ size = 24, color = '#000000' }: BowlIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 碗身 */}
        <Path
          d="M3 10H21C21 10 20 18 12 18C4 18 3 10 3 10Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 碗口 */}
        <Path
          d="M3 10C3 10 3 8 12 8C21 8 21 10 21 10"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 蒸汽 */}
        <Path
          d="M9 6C9 6 9 4 12 4C15 4 15 6 15 6"
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
