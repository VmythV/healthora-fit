// components/ui/Card.tsx
// 卡片组件

import React from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { theme } from '@/constants/theme'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * 卡片组件
 *
 * @example
 * ```tsx
 * // 基础卡片
 * <Card>
 *   <Text>卡片内容</Text>
 * </Card>
 *
 * // 可点击卡片
 * <Card onPress={() => console.log('点击')}>
 *   <Text>点击查看详情</Text>
 * </Card>
 *
 * // 自定义内边距
 * <Card padding="lg">
 *   <Text>大内边距</Text>
 * </Card>
 * ```
 */
export function Card({ children, onPress, style, padding = 'md', shadow = 'sm' }: CardProps) {
  const Container = onPress ? TouchableOpacity : View

  return (
    <Container
      style={[
        styles.base,
        styles[`padding_${padding}`],
        shadow !== 'none' && styles[`shadow_${shadow}`],
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
  },
  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: theme.spacing.sm,
  },
  padding_md: {
    padding: theme.spacing.base,
  },
  padding_lg: {
    padding: theme.spacing.xl,
  },
  // Shadow
  shadow_sm: {
    ...theme.shadow.sm,
  },
  shadow_md: {
    ...theme.shadow.md,
  },
  shadow_lg: {
    ...theme.shadow.lg,
  },
})
