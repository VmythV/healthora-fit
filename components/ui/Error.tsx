// components/ui/Error.tsx
// 错误状态组件

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from './Button';

interface ErrorProps {
  icon?: string;
  title?: string;
  message: string;
  retryText?: string;
  onRetry?: () => void;
}

/**
 * 错误状态组件
 *
 * @example
 * ```tsx
 * <Error
 *   message="网络连接失败，请检查网络设置"
 *   onRetry={handleRetry}
 * />
 *
 * <Error
 *   icon="😔"
 *   title="加载失败"
 *   message="无法加载数据，请稍后重试"
 *   retryText="重新加载"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function Error({
  icon = '⚠️',
  title,
  message,
  retryText = '重试',
  onRetry,
}: ErrorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>

      {title && <Text style={styles.title}>{title}</Text>}

      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Button
          title={retryText}
          onPress={onRetry}
          variant="primary"
          size="md"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    minWidth: 120,
  },
});
