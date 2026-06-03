// components/AnimatedCard.tsx
// 动画卡片组件

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { theme } from '@/constants/theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'scale';
}

export function AnimatedCard({
  children,
  style,
  onPress,
  delay = 0,
  animationType = 'fadeIn',
}: AnimatedCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    switch (animationType) {
      case 'fadeIn':
        animations.push(
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideUp':
        animations.push(
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              delay,
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }

    Animated.sequence(animations).start();
  }, []);

  const animatedStyle = {
    opacity,
    transform: [
      { translateY: animationType === 'slideUp' ? translateY : 0 },
      { scale: animationType === 'scale' ? scale : 1 },
    ],
  };

  const content = (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
});
