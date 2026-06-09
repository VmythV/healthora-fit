// app/settings/components/AIConfigForm.tsx
// AI 配置表单（自包含：自管表单 state，对外只暴露 onSaved/onCancel）
//
// P3-50：抽离原 ai-config.tsx 的 6 个表单 useState + handleSave/handleTest 逻辑。
// 父页面 (ai-config.tsx) 只关心"展示列表 vs 展示表单"二态切换。

import { logger } from '@/utils/logger'
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useI18n } from '@/hooks/useI18n'
import { theme } from '@/constants/theme'
import { AIConfig } from '@/types/ai'
import { aiConfigQueries } from '@/database/queries/aiConfig'
import { aiService } from '@/services/ai'
import { Icon } from '@/components/icons'
import { showNotification } from '@/components/ui'

interface AIConfigFormProps {
  initialConfig: AIConfig | null
  onSaved: () => Promise<void>
  onCancel: () => void
}

type ApiType = 'auto' | 'chat-completions' | 'responses'

export function AIConfigForm({ initialConfig, onSaved, onCancel }: AIConfigFormProps) {
  const { t } = useI18n()

  const [apiEndpoint, setApiEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('')
  const [apiType, setApiType] = useState<ApiType>('auto')
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // 编辑模式：组件挂载时把 initialConfig 灌进表单
  useEffect(() => {
    if (initialConfig) {
      logger.log('[AI Config] Loading config to form:', {
        apiEndpoint: initialConfig.apiEndpoint,
        modelName: initialConfig.modelName,
        hasApiKey: !!initialConfig.apiKey,
      })
      setApiEndpoint(initialConfig.apiEndpoint || '')
      setApiKey(initialConfig.apiKey || '')
      setModelName(initialConfig.modelName || '')
      // 检测 API 类型
      if (initialConfig.apiEndpoint?.endsWith('/responses')) {
        setApiType('responses')
      } else if (initialConfig.apiEndpoint?.endsWith('/chat/completions')) {
        setApiType('chat-completions')
      } else {
        setApiType('auto')
      }
    }
  }, [initialConfig])

  // 保存配置
  const handleSave = async () => {
    if (!apiEndpoint.trim()) {
      showNotification(t('settings.ai.endpointRequired'), 'error')
      return
    }
    if (!apiKey.trim()) {
      showNotification(t('settings.ai.apiKeyRequired'), 'error')
      return
    }
    if (!modelName.trim()) {
      showNotification(t('settings.ai.modelRequired'), 'error')
      return
    }

    try {
      setIsSaving(true)
      logger.log('[AI Config] Saving config...')

      // 根据 API 类型处理端点
      let finalEndpoint = apiEndpoint.trim()
      if (apiType === 'responses' && !finalEndpoint.endsWith('/responses')) {
        finalEndpoint = finalEndpoint.replace(/\/(chat\/completions)?$/, '') + '/responses'
      } else if (apiType === 'chat-completions' && !finalEndpoint.endsWith('/chat/completions')) {
        finalEndpoint = finalEndpoint.replace(/\/responses$/, '') + '/chat/completions'
      }

      logger.log('[AI Config] Final endpoint:', finalEndpoint)

      if (initialConfig) {
        // 更新现有配置
        await aiConfigQueries.update(initialConfig.id, {
          apiEndpoint: finalEndpoint,
          apiKey: apiKey.trim(),
          modelName: modelName.trim(),
          isActive: true,
        })
      } else {
        // 保存新配置
        await aiConfigQueries.save({
          apiEndpoint: finalEndpoint,
          apiKey: apiKey.trim(),
          modelName: modelName.trim(),
        })
      }

      logger.log('[AI Config] Config saved successfully')
      await onSaved()
      showNotification(t('settings.ai.saveSuccess'), 'success')
    } catch (error) {
      logger.error('[AI Config] Save failed:', error)
      showNotification(t('settings.ai.saveFailed'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // 测试连接
  const handleTest = async () => {
    try {
      setIsTesting(true)
      // P0.4：统一走 aiService.testConnection()（内部用 aiConnection 共享实现）
      const result = await aiService.testConnection()
      if (result.success) {
        showNotification(t('settings.ai.testSuccess'), 'success')
      } else {
        showNotification(result.error || t('settings.ai.testFailed'), 'error')
      }
    } catch (error) {
      showNotification(t('settings.ai.testFailed'), 'error')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>
        {initialConfig ? t('settings.ai.editConfig') : t('settings.ai.addConfig')}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('settings.ai.endpoint')}</Text>
        <TextInput
          style={styles.input}
          value={apiEndpoint}
          onChangeText={setApiEndpoint}
          placeholder="https://api.openai.com/v1"
          placeholderTextColor={theme.colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.inputHint}>{t('settings.ai.endpointHint')}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('settings.ai.apiKey')}</Text>
        <View style={styles.apiKeyContainer}>
          <TextInput
            style={[styles.input, styles.apiKeyInput]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor={theme.colors.text.tertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.showButton} onPress={() => setShowApiKey(!showApiKey)}>
            <Icon
              name={showApiKey ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHint}>{t('settings.ai.apiKeyHint')}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('settings.ai.model')}</Text>
        <TextInput
          style={styles.input}
          value={modelName}
          onChangeText={setModelName}
          placeholder="gpt-4o-mini"
          placeholderTextColor={theme.colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.inputHint}>{t('settings.ai.modelHint')}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('settings.ai.apiType')}</Text>
        <View style={styles.apiTypeContainer}>
          <TouchableOpacity
            style={[styles.apiTypeButton, apiType === 'auto' && styles.apiTypeButtonActive]}
            onPress={() => setApiType('auto')}
          >
            <Text style={[styles.apiTypeText, apiType === 'auto' && styles.apiTypeTextActive]}>
              {t('settings.ai.autoDetect')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.apiTypeButton,
              apiType === 'chat-completions' && styles.apiTypeButtonActive,
            ]}
            onPress={() => setApiType('chat-completions')}
          >
            <Text
              style={[
                styles.apiTypeText,
                apiType === 'chat-completions' && styles.apiTypeTextActive,
              ]}
            >
              {t('settings.ai.chatCompletions')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.apiTypeButton, apiType === 'responses' && styles.apiTypeButtonActive]}
            onPress={() => setApiType('responses')}
          >
            <Text style={[styles.apiTypeText, apiType === 'responses' && styles.apiTypeTextActive]}>
              {t('settings.ai.responses')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHint}>{t('settings.ai.apiTypeHint')}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTest}
          disabled={isTesting}
        >
          {isTesting ? (
            <ActivityIndicator size="small" color={theme.colors.primary.main} />
          ) : (
            <Text style={styles.testButtonText}>{t('settings.ai.testConnection')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  formTitle: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  inputHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiKeyInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  showButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
  },
  apiTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  apiTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  apiTypeButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  apiTypeText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  apiTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.base,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background.secondary,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  testButton: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  testButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primary.main,
  },
  saveButton: {
    backgroundColor: theme.colors.primary.main,
  },
  saveButtonText: {
    fontSize: theme.fontSize.body,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
})
