// hooks/useNotification.tsx
// 通知系统 Provider + Hook

import React, { createContext, useContext, useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ToastItem, ToastType, ToastItemView } from '@/components/ui/Toast'
import { AlertModalView, AlertModalConfig, AlertModalInstance, setGlobalConfirm } from '@/components/ui/AlertModal'

interface NotificationContextType {
  showNotification: (message: string, type?: ToastType) => void
  showConfirm: (config: AlertModalConfig) => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  showConfirm: async () => false,
})

/**
 * 通知系统 Provider
 *
 * 提供 showNotification（顶部 Toast）和 showConfirm（居中确认弹窗）
 *
 * @example
 * ```tsx
 * // _layout.tsx
 * <NotificationProvider>
 *   <Stack />
 * </NotificationProvider>
 *
 * // 任意组件
 * const { showNotification, showConfirm } = useNotification();
 *
 * showNotification('保存成功', 'success');
 *
 * const ok = await showConfirm({
 *   title: '删除',
 *   message: '确定删除？',
 *   type: 'danger',
 * });
 * ```
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirmInstance, setConfirmInstance] = useState<AlertModalInstance | null>(null)
  const toastIdRef = useRef(0)

  // Toast 通知
  const showNotification = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // 确认弹窗
  const showConfirm = useCallback((config: AlertModalConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmInstance({ config, resolve })
    })
  }, [])

  // 把当前 Provider 的 showConfirm 桥接到全局模块变量，
  // 让 `import { showConfirm } from '@/components/ui'` 的消费方能调到真正的 Promise。
  useEffect(() => {
    setGlobalConfirm(showConfirm)
    return () => setGlobalConfirm(null)
  }, [showConfirm])

  const handleConfirmDismiss = useCallback(
    (confirmed: boolean) => {
      if (confirmInstance) {
        confirmInstance.resolve(confirmed)
        setConfirmInstance(null)
      }
    },
    [confirmInstance]
  )

  // P3-46：删除 Provider → 全局模块变量的桥接 effect。
  // 当前 0 个业务组件使用 useNotification Hook；消费方全部走
  // `import { showNotification, showConfirm } from '@/components/ui'` 全局 API。
  // 桥接的 useEffect 属于"无意义的副作用"，删除后 NotificationContext 仍保留
  // 给未来真正用 Hook 的组件。

  // P1-11：value useMemo 稳定引用，避免 Provider 重渲染时所有 context 消费者跟随重渲染
  const value = useMemo<NotificationContextType>(
    () => ({ showNotification, showConfirm }),
    [showNotification, showConfirm]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast 通知层 */}
      {toasts.length > 0 && (
        <SafeAreaView style={styles.toastContainer} pointerEvents="box-none">
          <View style={styles.toastList}>
            {toasts.map((t) => (
              <ToastItemView key={t.id} toast={t} onDismiss={dismissToast} />
            ))}
          </View>
        </SafeAreaView>
      )}

      {/* 确认弹窗 */}
      {confirmInstance && (
        <AlertModalView instance={confirmInstance} onDismiss={handleConfirmDismiss} />
      )}
    </NotificationContext.Provider>
  )
}

/**
 * 通知系统 Hook
 */
export function useNotification(): NotificationContextType {
  return useContext(NotificationContext)
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toastList: {
    paddingTop: 8,
  },
})
