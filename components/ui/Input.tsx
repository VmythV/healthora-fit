// components/ui/Input.tsx
// 输入框组件

import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native'
import { theme } from '@/constants/theme'
import { Icon } from '@/components/icons'

type InputVariant = 'text' | 'number' | 'search'

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  variant?: InputVariant
  disabled?: boolean
  secureTextEntry?: boolean
  multiline?: boolean
  numberOfLines?: number
  maxLength?: number
  suffix?: string
  style?: ViewStyle
  inputStyle?: TextStyle
}

/**
 * 输入框组件
 *
 * @example
 * ```tsx
 * <Input
 *   label="用户名"
 *   value={username}
 *   onChangeText={setUsername}
 *   placeholder="请输入用户名"
 * />
 *
 * <Input
 *   label="体重"
 *   value={weight}
 *   onChangeText={setWeight}
 *   variant="number"
 *   suffix="kg"
 * />
 *
 * <Input
 *   value={search}
 *   onChangeText={setSearch}
 *   variant="search"
 *   placeholder="搜索..."
 * />
 * ```
 */
export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  variant = 'text',
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  suffix,
  style,
  inputStyle,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (variant) {
      case 'number':
        return 'decimal-pad'
      case 'search':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {variant === 'search' && (
          <Icon name="search" size={16} color={theme.colors.text.tertiary} />
        )}

        <TextInput
          style={[
            styles.input,
            variant === 'search' && styles.inputWithIcon,
            suffix && styles.inputWithSuffix,
            multiline && { height: numberOfLines * 24 },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType={getKeyboardType()}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base,
  },
  label: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.base,
  },
  focused: {
    borderColor: theme.colors.primary.main,
  },
  error: {
    borderColor: theme.colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  inputWithIcon: {
    marginLeft: theme.spacing.sm,
  },
  inputWithSuffix: {
    marginRight: theme.spacing.sm,
  },
  suffix: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
  errorText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
})
