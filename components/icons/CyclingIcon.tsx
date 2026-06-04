// components/icons/CyclingIcon.tsx
// 骑行图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface CyclingIconProps {
  size?: number;
  color?: string;
}

/**
 * 骑行图标
 *
 * @example
 * ```tsx
 * <CyclingIcon size={24} color="#10B981" />
 * ```
 */
export function CyclingIcon({ size = 24, color = '#000000' }: CyclingIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 左轮 */}
        <Circle
          cx="6"
          cy="17"
          r="3"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 右轮 */}
        <Circle
          cx="18"
          cy="17"
          r="3"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 车架 */}
        <Path
          d="M6 17L12 7L18 17"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 车把 */}
        <Path
          d="M12 7L16 7"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 座椅 */}
        <Path
          d="M10 7L12 5"
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
