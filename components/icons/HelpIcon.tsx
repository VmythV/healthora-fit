// components/icons/HelpIcon.tsx
// 帮助图标（问号）

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface HelpIconProps {
  size?: number;
  color?: string;
}

/**
 * 帮助图标（问号）
 *
 * @example
 * ```tsx
 * <HelpIcon size={24} color="#10B981" />
 * ```
 */
export function HelpIcon({ size = 24, color = '#000000' }: HelpIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 圆圈 */}
        <Circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 问号 */}
        <Path
          d="M9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12V14"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 问号点 */}
        <Path
          d="M12 17V17.01"
          stroke={color}
          strokeWidth={2}
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
