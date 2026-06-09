// app/settings/ai-config.tsx
// AI 配置路由壳
//
// P3-50：拆出 AIConfigForm + AIConfigList 后，本文件只剩：
//   - 状态：configs / activeConfig / editingConfig（3 个）
//   - 副作用：useEffect loadConfigs、handleDelete 完整流程
//   - 视图：isEditing ? <AIConfigForm /> : <AIConfigList /> + 帮助卡 + 空态
// 移除了 6 个表单 useState、Alert 死引用。

import { logger } from '@/utils/logger'
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useI18n } from '@/hooks/useI18n'
import { theme } from '@/constants/theme'
import { AIConfig } from '@/types/ai'
import { aiConfigQueries } from '@/database/queries/aiConfig'
import { aiService } from '@/services/ai'
import { Icon, BackIcon } from '@/components/icons'
import { showNotification } from '@/components/ui'
import { AIConfigForm } from '@/components/settings/AIConfigForm'
import { AIConfigList } from '@/components/settings/AIConfigList'

export default function AIConfigScreen() {
  const { t } = useI18n()
  const router = useRouter()

  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [activeConfig, setActiveConfig] = useState<AIConfig | null>(null)
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      logger.log('[AI Config] Loading configs...')
      const [allConfigs, active] = await Promise.all([
        aiConfigQueries.getAll(),
        aiConfigQueries.getActive(),
      ])

      logger.log('[AI Config] All configs:', allConfigs)
      logger.log('[AI Config] Active config:', active)

      setConfigs(allConfigs || [])
      setActiveConfig(active)
    } catch (error) {
      logger.error('[AI Config] Failed to load configs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  // 删除流程：完整在父页执行（list 不感知 aiService）
  const handleDelete = async (config: AIConfig) => {
    try {
      await aiConfigQueries.delete(config.id)
      await loadConfigs()
      await aiService.loadConfig()
      showNotification(t('settings.ai.deleteSuccess'), 'success')
    } catch (error) {
      logger.error('[AI Config] Delete failed:', error)
      showNotification(t('settings.ai.deleteFailed'), 'error')
    }
  }

  // 点击配置项：进入编辑
  const handleEdit = (config: AIConfig) => {
    setEditingConfig(config)
    setIsEditing(true)
  }

  // 新增配置
  const handleAddNew = () => {
    setEditingConfig(null)
    setIsEditing(true)
  }

  // 保存完成（Form onSaved）：reload + 清空 editing
  const handleSaved = async () => {
    await loadConfigs()
    await aiService.loadConfig()
    setEditingConfig(null)
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancel = () => {
    setEditingConfig(null)
    setIsEditing(false)
  }

  // 是否在编辑模式（用独立 boolean state 避免 editingConfig=null 与 undefined 混淆）
  const _isEditing = isEditing

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.ai.title')}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.ai.title')}</Text>
        {!isEditing && (
          <TouchableOpacity onPress={handleAddNew} style={styles.backButton}>
            <Icon name="add" size={24} color={theme.colors.primary.main} />
          </TouchableOpacity>
        )}
        {isEditing && <View style={styles.backButton} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          /* 表单：编辑或新增 */
          <AIConfigForm
            initialConfig={editingConfig}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        ) : (
          /* 列表：展示 + 空态 + 帮助 */
          <>
            {configs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="ai" size={48} color={theme.colors.text.tertiary} />
                <Text style={styles.emptyText}>{t('settings.ai.noConfigs')}</Text>
                <TouchableOpacity style={styles.addFirstButton} onPress={handleAddNew}>
                  <Text style={styles.addFirstButtonText}>{t('settings.ai.addFirst')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <AIConfigList
                configs={configs}
                activeConfig={activeConfig}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {/* 帮助信息 */}
            <View style={styles.helpCard}>
              <View style={styles.helpTitleRow}>
                <Icon name="help" size={18} color={theme.colors.text.primary} />
                <Text style={styles.helpTitle}>{t('settings.ai.help')}</Text>
              </View>
              <Text style={styles.helpText}>{t('settings.ai.helpText1')}</Text>
              <Text style={styles.helpText}>{t('settings.ai.helpText2')}</Text>
              <Text style={styles.helpText}>{t('settings.ai.helpText3')}</Text>

              <View style={styles.exampleSection}>
                <Text style={styles.exampleTitle}>{t('settings.ai.exampleTitle')}</Text>
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleLabel}>OpenAI:</Text>
                  <Text style={styles.exampleValue}>https://api.openai.com/v1</Text>
                </View>
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleLabel}>Claude:</Text>
                  <Text style={styles.exampleValue}>https://api.anthropic.com/v1</Text>
                </View>
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleLabel}>{t('settings.ai.volcengine')}:</Text>
                  <Text style={styles.exampleValue}>https://ark.cn-beijing.volces.com/api/v3</Text>
                </View>
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleLabel}>{t('settings.ai.volcengine')} Responses:</Text>
                  <Text style={styles.exampleValue}>
                    https://ark.cn-beijing.volces.com/api/v3/responses
                  </Text>
                </View>
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleLabel}>{t('settings.ai.localModel')}:</Text>
                  <Text style={styles.exampleValue}>http://localhost:11434/v1</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 空状态
  emptyCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addFirstButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
  },
  addFirstButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  // 帮助信息
  helpCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  },
  helpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  helpTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  helpText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  exampleSection: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
  },
  exampleTitle: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  exampleItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  exampleLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.secondary,
    width: 120,
  },
  exampleValue: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.primary.main,
    flex: 1,
  },
})
