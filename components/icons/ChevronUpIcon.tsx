// components/icons/ChevronUpIcon.tsx
// 上尖角图标 - 展开/折叠状态指示

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChevronUpIconProps {
  size?: number;
  color?: string;
}

/**
 * 上尖角图标
 *
 * @example
 * ```tsx
 * <ChevronUpIcon size={20} color="#9CA3AF" />
 * ```
 */
export function ChevronUpIcon({ size = 24, color = '#000000' }: ChevronUpIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 15L12 9L18 15"
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
