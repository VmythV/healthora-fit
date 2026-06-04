// app/settings/ai-config.tsx
// AI 配置页面

import { logger } from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { aiConfigQueries } from '@/database/queries/aiConfig';
import { aiService } from '@/services/ai';
import { AIConfig } from '@/types/ai';
import { Icon, BackIcon, CheckIcon, EditIcon, DeleteIcon } from '@/components/icons';

export default function AIConfigScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<AIConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);

  // 表单状态
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [apiType, setApiType] = useState<'auto' | 'chat-completions' | 'responses'>('auto');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // 加载配置列表
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      logger.log('[AI Config] Loading configs...');
      const allConfigs = await aiConfigQueries.getAll();
      const active = await aiConfigQueries.getActive();

      logger.log('[AI Config] All configs:', allConfigs);
      logger.log('[AI Config] Active config:', active);

      setConfigs(allConfigs || []);
      setActiveConfig(active);

      // 如果有活跃配置，加载到表单
      if (active && !isEditing) {
        loadConfigToForm(active);
      }
    } catch (error) {
      logger.error('[AI Config] Failed to load configs:', error);
    }
  };

  // 加载配置到表单
  const loadConfigToForm = (config: AIConfig) => {
    logger.log('[AI Config] Loading config to form:', config);
    logger.log('[AI Config] apiEndpoint:', config.apiEndpoint);
    logger.log('[AI Config] apiKey:', config.apiKey);
    logger.log('[AI Config] modelName:', config.modelName);

    setApiEndpoint(config.apiEndpoint || '');
    setApiKey(config.apiKey || '');
    setModelName(config.modelName || '');

    // 检测 API 类型
    if (config.apiEndpoint?.endsWith('/responses')) {
      setApiType('responses');
    } else if (config.apiEndpoint?.endsWith('/chat/completions')) {
      setApiType('chat-completions');
    } else {
      setApiType('auto');
    }

    logger.log('[AI Config] Form loaded successfully');
  };

  // 点击配置项
  const handleConfigPress = (config: AIConfig) => {
    logger.log('[AI Config] Config pressed:', config);
    setEditingConfig(config);
    loadConfigToForm(config);
    setIsEditing(true);
  };

  // 新增配置
  const handleAddNew = () => {
    setEditingConfig(null);
    setApiEndpoint('');
    setApiKey('');
    setModelName('');
    setApiType('auto');
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditingConfig(null);
    // 恢复活跃配置
    if (activeConfig) {
      loadConfigToForm(activeConfig);
    }
  };

  // 删除配置
  const handleDelete = (config: AIConfig) => {
    Alert.alert(
      t('common.confirm'),
      t('settings.ai.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await aiConfigQueries.delete(config.id);
              await loadConfigs();
              await aiService.loadConfig();
              Alert.alert(t('common.success'), t('settings.ai.deleteSuccess'));
            } catch (error) {
              logger.error('[AI Config] Delete failed:', error);
              Alert.alert(t('common.error'), t('settings.ai.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  // 保存配置
  const handleSave = async () => {
    if (!apiEndpoint.trim()) {
      Alert.alert(t('common.error'), t('settings.ai.endpointRequired'));
      return;
    }
    if (!apiKey.trim()) {
      Alert.alert(t('common.error'), t('settings.ai.apiKeyRequired'));
      return;
    }
    if (!modelName.trim()) {
      Alert.alert(t('common.error'), t('settings.ai.modelRequired'));
      return;
    }

    try {
      setIsSaving(true);
      logger.log('[AI Config] Saving config...');

      // 根据 API 类型处理端点
      let finalEndpoint = apiEndpoint.trim();
      if (apiType === 'responses' && !finalEndpoint.endsWith('/responses')) {
        finalEndpoint = finalEndpoint.replace(/\/(chat\/completions)?$/, '') + '/responses';
      } else if (apiType === 'chat-completions' && !finalEndpoint.endsWith('/chat/completions')) {
        finalEndpoint = finalEndpoint.replace(/\/responses$/, '') + '/chat/completions';
      }

      logger.log('[AI Config] Final endpoint:', finalEndpoint);

      if (editingConfig) {
        // 更新现有配置
        await aiConfigQueries.update(editingConfig.id, {
          apiEndpoint: finalEndpoint,
          apiKey: apiKey.trim(),
          modelName: modelName.trim(),
          isActive: true,
        });
      } else {
        // 保存新配置
        await aiConfigQueries.save({
          apiEndpoint: finalEndpoint,
          apiKey: apiKey.trim(),
          modelName: modelName.trim(),
        });
      }

      logger.log('[AI Config] Config saved successfully');

      // 重新加载配置
      await loadConfigs();
      await aiService.loadConfig();

      setIsEditing(false);
      setEditingConfig(null);

      Alert.alert(t('common.success'), t('settings.ai.saveSuccess'));
    } catch (error) {
      logger.error('[AI Config] Save failed:', error);
      Alert.alert(t('common.error'), t('settings.ai.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    try {
      setIsTesting(true);
      const result = await aiConfigQueries.testConnection();
      if (result.success) {
        Alert.alert(t('common.success'), t('settings.ai.testSuccess'));
      } else {
        Alert.alert(t('common.error'), result.error || t('settings.ai.testFailed'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.ai.testFailed'));
    } finally {
      setIsTesting(false);
    }
  };

  // 获取 API 类型显示名称
  const getApiTypeName = (endpoint: string) => {
    if (endpoint?.endsWith('/responses')) {
      return 'Responses API';
    } else if (endpoint?.endsWith('/chat/completions')) {
      return 'Chat Completions';
    }
    return 'Auto';
  };

  // 隐藏 API Key
  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return '***';
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.ai.title')}</Text>
        {!isEditing && (
          <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
            <Icon name="add" size={24} color={theme.colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          /* 编辑表单 */
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingConfig ? t('settings.ai.editConfig') : t('settings.ai.addConfig')}
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
                <TouchableOpacity
                  style={styles.showButton}
                  onPress={() => setShowApiKey(!showApiKey)}
                >
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
                  style={[
                    styles.apiTypeButton,
                    apiType === 'auto' && styles.apiTypeButtonActive,
                  ]}
                  onPress={() => setApiType('auto')}
                >
                  <Text
                    style={[
                      styles.apiTypeText,
                      apiType === 'auto' && styles.apiTypeTextActive,
                    ]}
                  >
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
                  style={[
                    styles.apiTypeButton,
                    apiType === 'responses' && styles.apiTypeButtonActive,
                  ]}
                  onPress={() => setApiType('responses')}
                >
                  <Text
                    style={[
                      styles.apiTypeText,
                      apiType === 'responses' && styles.apiTypeTextActive,
                    ]}
                  >
                    {t('settings.ai.responses')}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>{t('settings.ai.apiTypeHint')}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
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
        ) : (
          /* 配置列表 */
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
              configs.map((config) => (
                <TouchableOpacity
                  key={config.id}
                  style={[
                    styles.configCard,
                    activeConfig?.id === config.id && styles.configCardActive,
                  ]}
                  onPress={() => handleConfigPress(config)}
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
                      <Text style={styles.configKey}>
                        API Key: {maskApiKey(config.apiKey)}
                      </Text>
                    </View>
                    <View style={styles.configActions}>
                      <Text style={styles.configType}>
                        {getApiTypeName(config.apiEndpoint)}
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(config)}
                      >
                        <DeleteIcon size={18} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
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
                  <Text style={styles.exampleValue}>https://ark.cn-beijing.volces.com/api/v3/responses</Text>
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
  );
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  // 配置列表样式
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
  // 空状态样式
  emptyCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing['2xl'],
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
  // 表单样式
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
  // 帮助信息样式
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
});
