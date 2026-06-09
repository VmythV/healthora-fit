// components/ui/AlertModal.tsx
// 确认弹窗组件

import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'
import { Modal } from './Modal'
import { Button } from './Button'
import { WarningIcon, InfoIcon } from '@/components/icons'

export type AlertType = 'danger' | 'default'

export interface AlertModalConfig {
  title: string
  message: string
  type?: AlertType
  confirmText?: string
  cancelText?: string
}

export interface AlertModalInstance {
  config: AlertModalConfig
  resolve: (confirmed: boolean) => void
}

/**
 * 确认弹窗组件
 *
 * 支持 danger（红色确认按钮）和 default（绿色确认按钮）两种变体
 */
export function AlertModalView({
  instance,
  onDismiss,
}: {
  instance: AlertModalInstance
  onDismiss: (confirmed: boolean) => void
}) {
  const { config } = instance
  const type = config.type || 'default'
  const isDanger = type === 'danger'

  const handleConfirm = useCallback(() => {
    onDismiss(true)
  }, [onDismiss])

  const handleCancel = useCallback(() => {
    onDismiss(false)
  }, [onDismiss])

  const iconColor = isDanger ? theme.colors.error : theme.colors.primary.main
  const Icon = isDanger ? WarningIcon : InfoIcon

  return (
    <Modal visible={true} onClose={handleCancel} type="alert" showClose={false}>
      <View style={styles.iconWrapper}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isDanger ? theme.colors.error + '15' : theme.colors.primary.light },
          ]}
        >
          <Icon size={28} color={iconColor} />
        </View>
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>

      <View style={styles.buttons}>
        <Button
          title={config.cancelText || '取消'}
          onPress={handleCancel}
          variant="ghost"
          size="md"
          style={styles.button}
        />
        <Button
          title={config.confirmText || '确定'}
          onPress={handleConfirm}
          variant={isDanger ? 'danger' : 'primary'}
          size="md"
          style={styles.button}
        />
      </View>
    </Modal>
  )
}

// ===== 全局确认弹窗管理 =====

type ConfirmHandler = (config: AlertModalConfig) => Promise<boolean>

let globalConfirm: ConfirmHandler | null = null

/**
 * 注册全局确认弹窗函数（由 NotificationProvider 调用）
 */
export function setGlobalConfirm(handler: ConfirmHandler | null) {
  globalConfirm = handler
}

/**
 * 全局确认弹窗 API
 * @example
 * const confirmed = await showConfirm({
 *   title: '删除记录',
 *   message: '确定要删除这条记录吗？',
 *   type: 'danger',
 *   confirmText: '删除',
 * });
 */
export function showConfirm(config: AlertModalConfig): Promise<boolean> {
  if (globalConfirm) {
    return globalConfirm(config)
  }
  // 降级：返回 false
  return Promise.resolve(false)
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  button: {
    minWidth: 90,
  },
})
