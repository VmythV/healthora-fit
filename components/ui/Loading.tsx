// components/ui/Loading.tsx
// 加载组件

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { theme } from '@/constants/theme';

interface LoadingProps {
  visible: boolean;
  message?: string;
  overlay?: boolean;
}

/**
 * 加载组件
 *
 * @example
 * ```tsx
 * // 全屏加载
 * <Loading visible={isLoading} message="加载中..." />
 *
 * // 覆盖层加载
 * <Loading visible={isLoading} overlay message="保存中..." />
 * ```
 */
export function Loading({
  visible,
  message,
  overlay = false,
}: LoadingProps) {
  if (!visible) return null;

  if (overlay) {
    return (
      <Modal transparent visible={visible}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator
              color={theme.colors.primary.main}
              size="large"
            />
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator
        color={theme.colors.primary.main}
        size="large"
      />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    ...theme.shadow.lg,
  },
  message: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.base,
  },
});
