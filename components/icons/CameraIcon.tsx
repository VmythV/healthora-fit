// components/icons/CameraIcon.tsx
// 相机图标

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface CameraIconProps {
  size?: number;
  color?: string;
}

/**
 * 相机图标
 *
 * @example
 * ```tsx
 * <CameraIcon size={24} color="#10B981" />
 * ```
 */
export function CameraIcon({ size = 24, color = '#000000' }: CameraIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={12}
          cy={13}
          r={4}
          stroke={color}
          strokeWidth={1.5}
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
