// components/ui/Toast.tsx
// 提示通知组件

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { CheckIcon, CloseIcon, WarningIcon, InfoIcon } from '@/components/icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}

const ICON_MAP = {
  success: CheckIcon,
  error: CloseIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

/**
 * 单个 Toast 通知
 */
function ToastItemView({ toast, onDismiss }: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      dismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  }, [fadeAnim, slideAnim, onDismiss, toast.id]);

  const Icon = ICON_MAP[toast.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        styles[`toast_${toast.type}`],
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.toastInner}
        onPress={dismiss}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Icon size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export { ToastItemView };

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toast: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.md,
  },
  toast_success: {
    backgroundColor: theme.colors.success,
  },
  toast_error: {
    backgroundColor: theme.colors.error,
  },
  toast_warning: {
    backgroundColor: theme.colors.warning,
  },
  toast_info: {
    backgroundColor: theme.colors.info,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.body,
    color: '#FFFFFF',
  },
});

// ===== 全局通知管理 =====

type NotificationHandler = (message: string, type: ToastType) => void;

let globalNotify: NotificationHandler | null = null;

/**
 * 注册全局通知函数（由 NotificationProvider 调用）
 */
export function setGlobalNotify(handler: NotificationHandler | null) {
  globalNotify = handler;
}

/**
 * 全局通知 API
 * @example showNotification('保存成功', 'success')
 */
export function showNotification(message: string, type: ToastType = 'info') {
  if (globalNotify) {
    globalNotify(message, type);
  } else {
    // 降级：使用 console
    console.log(`[Notification] ${type}: ${message}`);
  }
}
