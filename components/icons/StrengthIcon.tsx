// components/icons/StrengthIcon.tsx
// 力量训练图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface StrengthIconProps {
  size?: number;
  color?: string;
}

/**
 * 力量训练图标（哑铃）
 *
 * @example
 * ```tsx
 * <StrengthIcon size={24} color="#10B981" />
 * ```
 */
export function StrengthIcon({ size = 24, color = '#000000' }: StrengthIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 左侧重量 */}
        <Path
          d="M6 8V16"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 10V14"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右侧重量 */}
        <Path
          d="M18 8V16"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20 10V14"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 杠铃杆 */}
        <Path
          d="M6 12H18"
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
