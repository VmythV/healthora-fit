// app/settings/ai-config.tsx
// AI 配置页面

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
import { AIConfig } from '@/types/ai';
import { Icon } from '@/components/icons';

export default function AIConfigScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const [config, setConfig] = useState<AIConfig | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const activeConfig = await aiConfigQueries.getActive();
      if (activeConfig) {
        setConfig(activeConfig);
        setApiEndpoint(activeConfig.apiEndpoint);
        setApiKey(activeConfig.apiKey);
        setModelName(activeConfig.modelName);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
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
      await aiConfigQueries.save({
        apiEndpoint: apiEndpoint.trim(),
        apiKey: apiKey.trim(),
        modelName: modelName.trim(),
      });
      await loadConfig();
      Alert.alert(t('common.success'), t('settings.ai.saveSuccess'));
    } catch (error) {
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
      if (result) {
        Alert.alert(t('common.success'), t('settings.ai.testSuccess'));
      } else {
        Alert.alert(t('common.error'), t('settings.ai.testFailed'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.ai.testFailed'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.ai.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 配置表单 */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t('settings.ai.config')}</Text>

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

          <View style={styles.buttonRow}>
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
              <Text style={styles.exampleLabel}>{t('settings.ai.localModel')}:</Text>
              <Text style={styles.exampleValue}>http://localhost:11434/v1</Text>
            </View>
          </View>
        </View>
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
  backText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
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
  showButtonText: {
    fontSize: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.base,
    marginTop: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.base,
    minWidth: 100,
    alignItems: 'center',
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
    width: 80,
  },
  exampleValue: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.primary.main,
    flex: 1,
  },
});
