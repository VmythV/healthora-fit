// components/ui/Toast.tsx
// 提示组件

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { CheckIcon, CloseIcon, WarningIcon, InfoIcon } from '@/components/icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

/**
 * 提示组件
 *
 * @example
 * ```tsx
 * <Toast message="保存成功" type="success" />
 * <Toast message="操作失败" type="error" />
 * <Toast message="请注意" type="warning" />
 * <Toast message="提示信息" type="info" />
 * ```
 */
export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // 显示动画
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 自动隐藏
    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onHide?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        styles[`container_${type}`],
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.iconContainer}>
        {type === 'success' && <CheckIcon size={18} color="#FFFFFF" />}
        {type === 'error' && <CloseIcon size={18} color="#FFFFFF" />}
        {type === 'warning' && <WarningIcon size={18} color="#FFFFFF" />}
        {type === 'info' && <InfoIcon size={18} color="#FFFFFF" />}
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.md,
  },
  container_success: {
    backgroundColor: theme.colors.success,
  },
  container_error: {
    backgroundColor: theme.colors.error,
  },
  container_warning: {
    backgroundColor: theme.colors.warning,
  },
  container_info: {
    backgroundColor: theme.colors.info,
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

// 全局 Toast 管理
let toastRef: ((message: string, type?: ToastType) => void) | null = null;

export function setToastRef(ref: (message: string, type?: ToastType) => void) {
  toastRef = ref;
}

export function showToast(message: string, type: ToastType = 'info') {
  toastRef?.(message, type);
}
