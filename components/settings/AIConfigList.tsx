// app/settings/components/AIConfigList.tsx
// AI 配置列表（纯展示）
//
// P3-50：抽离原 ai-config.tsx 的 configCard 列表渲染 + 删除确认。
// 删除流程完整在父页 handleDelete 中，list 只调 onDelete(config)。

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useI18n } from '@/hooks/useI18n'
import { theme } from '@/constants/theme'
import { AIConfig } from '@/types/ai'
import { CheckIcon, DeleteIcon } from '@/components/icons'
import { showConfirm } from '@/components/ui'

interface AIConfigListProps {
  configs: AIConfig[]
  activeConfig: AIConfig | null
  onEdit: (config: AIConfig) => void
  onDelete: (config: AIConfig) => Promise<void>
}

export function AIConfigList({ configs, activeConfig, onEdit, onDelete }: AIConfigListProps) {
  const { t } = useI18n()

  // 获取 API 类型显示名称
  const getApiTypeName = (endpoint: string) => {
    if (endpoint?.endsWith('/responses')) {
      return 'Responses API'
    } else if (endpoint?.endsWith('/chat/completions')) {
      return 'Chat Completions'
    }
    return 'Auto'
  }

  // 隐藏 API Key
  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return '***'
    return key.substring(0, 6) + '...' + key.substring(key.length - 4)
  }

  // 删除配置（带确认）
  const handleDelete = async (config: AIConfig) => {
    const ok = await showConfirm({
      title: t('common.confirm'),
      message: t('settings.ai.deleteConfirm'),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (ok) {
      await onDelete(config)
    }
  }

  return (
    <>
      {configs.map((config) => (
        <TouchableOpacity
          key={config.id}
          style={[styles.configCard, activeConfig?.id === config.id && styles.configCardActive]}
          onPress={() => onEdit(config)}
        >
          <View style={styles.configHeader}>
            <View style={styles.configInfo}>
              <View style={styles.configTitleRow}>
                <Text style={styles.configModel}>{config.modelName}</Text>
                {activeConfig?.id === config.id && (
                  <View style={styles.activeBadge}>
                    <CheckIcon size={12} color={theme.colors.success} />
                    <Text style={styles.activeText}>{t('settings.ai.active')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.configEndpoint} numberOfLines={1}>
                {config.apiEndpoint}
              </Text>
              <Text style={styles.configKey}>API Key: {maskApiKey(config.apiKey)}</Text>
            </View>
            <View style={styles.configActions}>
              <Text style={styles.configType}>{getApiTypeName(config.apiEndpoint)}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(config)}>
                <DeleteIcon size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  configCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  configCardActive: {
    borderColor: theme.colors.primary.main,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  configInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  configTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  configModel: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  activeText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.success,
  },
  configEndpoint: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  configKey: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  configActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  configType: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
})
