// components/ui/Empty.tsx
// 空状态组件

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from './Button';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';

interface EmptyProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

/**
 * 空状态组件
 *
 * @example
 * ```tsx
 * <Empty
 *   icon="plate"
 *   title="还没有饮食记录"
 *   description="点击下方按钮开始记录你的第一餐"
 *   actionTitle="记录饮食"
 *   onAction={() => router.push('/diet/record')}
 * />
 * ```
 */
export function Empty({
  icon,
  title,
  description,
  actionTitle,
  onAction,
}: EmptyProps) {
  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon name={icon} size={64} color={theme.colors.text.tertiary} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
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
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    minWidth: 120,
  },
});
