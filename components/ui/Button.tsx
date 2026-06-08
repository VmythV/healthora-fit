// components/ui/Button.tsx
// 按钮组件

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * 按钮组件
 *
 * P2-22：新增 `danger` variant（红色，危险操作用）
 *
 * @example
 * ```tsx
 * <Button title="保存" onPress={handleSave} />
 * <Button title="取消" onPress={handleCancel} variant="secondary" />
 * <Button title="删除" onPress={handleDelete} variant="ghost" />
 * <Button title="永久删除" onPress={handleDelete} variant="danger" />
 * <Button title="加载中" onPress={() => {}} loading />
 * <Button title="禁用" onPress={() => {}} disabled />
 * ```
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={(variant === 'primary' || variant === 'danger') ? '#FFFFFF' : theme.colors.primary.main}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  // Variants
  primary: {
    backgroundColor: theme.colors.primary.main,
  },
  secondary: {
    backgroundColor: theme.colors.primary.light,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  // Sizes
  size_sm: {
    height: 32,
    paddingHorizontal: theme.spacing.sm,
  },
  size_md: {
    height: 40,
    paddingHorizontal: theme.spacing.base,
  },
  size_lg: {
    height: 48,
    paddingHorizontal: theme.spacing.xl,
  },
  // Disabled
  disabled: {
    opacity: 0.5,
  },
  // Text
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: theme.colors.primary.dark,
  },
  text_ghost: {
    color: theme.colors.primary.main,
  },
  text_danger: {
    color: '#FFFFFF',
  },
  // Text Sizes
  textSize_sm: {
    fontSize: theme.fontSize.bodySm,
  },
  textSize_md: {
    fontSize: theme.fontSize.body,
  },
  textSize_lg: {
    fontSize: theme.fontSize.bodyLg,
  },
  textWithIcon: {
    marginLeft: theme.spacing.sm,
  },
});
