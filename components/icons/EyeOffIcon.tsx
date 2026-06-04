// components/icons/EyeOffIcon.tsx
// 眼睛关闭图标（隐藏）

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface EyeOffIconProps {
  size?: number;
  color?: string;
}

/**
 * 眼睛关闭图标（隐藏）
 *
 * @example
 * ```tsx
 * <EyeOffIcon size={24} color="#6B7280" />
 * ```
 */
export function EyeOffIcon({ size = 24, color = '#000000' }: EyeOffIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 眼睛外轮廓 */}
        <Path
          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 瞳孔 */}
        <Circle
          cx="12"
          cy="12"
          r="3"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 斜线（表示隐藏） */}
        <Path
          d="M4 4L20 20"
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
