// components/icons/SearchIcon.tsx
// 搜索图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface SearchIconProps {
  size?: number;
  color?: string;
}

/**
 * 搜索图标
 *
 * @example
 * ```tsx
 * <SearchIcon size={24} color="#10B981" />
 * ```
 */
export function SearchIcon({ size = 24, color = '#000000' }: SearchIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 放大镜 */}
        <Circle
          cx="11"
          cy="11"
          r="7"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 手柄 */}
        <Path
          d="M16 16L20 20"
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
