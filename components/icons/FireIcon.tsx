// components/icons/FireIcon.tsx
// 火焰图标（卡路里）

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface FireIconProps {
  size?: number;
  color?: string;
}

/**
 * 火焰图标（卡路里）
 *
 * @example
 * ```tsx
 * <FireIcon size={24} color="#EF4444" />
 * ```
 */
export function FireIcon({ size = 24, color = '#000000' }: FireIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2C8 6 4 10 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 10 16 6 12 2Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 12C10 14 8 16 8 18C8 20.21 9.79 22 12 22C14.21 22 16 20.21 16 18C16 16 14 14 12 12Z"
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
