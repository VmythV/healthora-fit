// components/ui/Modal.tsx
// 弹窗组件

import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from './Button';
import { CloseIcon } from '@/components/icons';

type ModalType = 'alert' | 'bottom';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: string;
  children?: React.ReactNode;
  showClose?: boolean;
  style?: ViewStyle;
}

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'ghost' | 'danger';
}

/**
 * 弹窗组件
 *
 * @example
 * ```tsx
 * // 基础弹窗
 * <Modal visible={visible} onClose={() => setVisible(false)}>
 *   <Text>弹窗内容</Text>
 * </Modal>
 *
 * // 底部弹窗
 * <Modal visible={visible} onClose={() => setVisible(false)} type="bottom">
 *   <Text>底部弹窗内容</Text>
 * </Modal>
 *
 * // 确认弹窗
 * <ConfirmModal
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   onConfirm={handleConfirm}
 *   title="确认删除"
 *   message="删除后无法恢复，确定要删除吗？"
 * />
 * ```
 */
export function Modal({
  visible,
  onClose,
  type = 'alert',
  title,
  children,
  showClose = true,
  style,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={type === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            type === 'alert' ? styles.alertContainer : styles.bottomContainer,
            style,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 标题栏 */}
          {(title || showClose) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <CloseIcon size={18} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 内容 */}
          <View style={styles.content}>{children}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

/**
 * 确认弹窗组件
 *
 * @example
 * ```tsx
 * <ConfirmModal
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   onConfirm={handleDelete}
 *   title="确认删除"
 *   message="删除后无法恢复，确定要删除吗？"
 *   confirmText="删除"
 *   cancelText="取消"
 * />
 * ```
 */
export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      type="alert"
      showClose={false}
    >
      <Text style={styles.confirmTitle}>{title}</Text>
      <Text style={styles.confirmMessage}>{message}</Text>

      <View style={styles.confirmButtons}>
        <Button
          title={cancelText}
          onPress={onClose}
          variant="ghost"
          size="md"
          style={styles.confirmButton}
        />
        <Button
          title={confirmText}
          onPress={() => {
            onConfirm();
            onClose();
          }}
          variant={confirmVariant}
          size="md"
          style={styles.confirmButton}
        />
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadow.lg,
  },
  bottomContainer: {
    width: width,
    maxHeight: height * 0.7,
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    position: 'absolute',
    bottom: 0,
    ...theme.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  title: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    fontSize: 18,
    color: theme.colors.text.tertiary,
  },
  content: {
    // 内容区域
  },
  // 确认弹窗样式
  confirmTitle: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  confirmMessage: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  confirmButton: {
    minWidth: 80,
  },
});
