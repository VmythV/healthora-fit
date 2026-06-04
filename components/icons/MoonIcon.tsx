// components/icons/MoonIcon.tsx
// 月亮图标（晚餐）

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MoonIconProps {
  size?: number;
  color?: string;
}

/**
 * 月亮图标（晚餐）
 *
 * @example
 * ```tsx
 * <MoonIcon size={24} color="#6366F1" />
 * ```
 */
export function MoonIcon({ size = 24, color = '#000000' }: MoonIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
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
