// components/icons/HomeIcon.tsx
// 首页图标

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

interface HomeIconProps {
  size?: number;
  color?: string;
}

/**
 * 极简首页图标（纯线条、零冗余元素）
 *
 * @example
 * ```tsx
 * <HomeIcon size={24} color="#10B981" />
 * ```
 */
export function HomeIcon({ size = 24, color = "#000000" }: HomeIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 21V10.75L12 4L20 10.75V21H14V15H10V21H4Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
