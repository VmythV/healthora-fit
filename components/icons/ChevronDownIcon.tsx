// components/icons/ChevronDownIcon.tsx
// 下尖角图标 - 展开/折叠状态指示

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChevronDownIconProps {
  size?: number;
  color?: string;
}

/**
 * 下尖角图标
 *
 * @example
 * ```tsx
 * <ChevronDownIcon size={20} color="#9CA3AF" />
 * ```
 */
export function ChevronDownIcon({ size = 24, color = '#000000' }: ChevronDownIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 9L12 15L18 9"
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
