// components/icons/CheckIcon.tsx
// 勾选图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CheckIconProps {
  size?: number;
  color?: string;
}

/**
 * 勾选图标
 *
 * @example
 * ```tsx
 * <CheckIcon size={24} color="#10B981" />
 * ```
 */
export function CheckIcon({ size = 24, color = '#000000' }: CheckIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 13L9 17L19 7"
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
