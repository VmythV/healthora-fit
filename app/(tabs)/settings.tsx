// app/(tabs)/settings.tsx
// 设置页面

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useGoals } from '@/hooks/useGoals';
import { Locale } from '@/constants/i18n';
import { dataTransferService } from '@/services/dataTransfer';
import { aiConfigQueries } from '@/database/queries/aiConfig';
import { Icon, ArrowRightIcon, CheckIcon } from '@/components/icons';
import { useWeekStartDay, WEEK_START_OPTIONS } from '@/hooks/useWeekStartDay';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, locale, setLocale, supportedLocales } = useI18n();
  const { activeGoal, loadActive } = useGoals();
  const { weekStartDay, setWeekStartDay } = useWeekStartDay();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiEndpoint, setAiEndpoint] = useState('');

  useEffect(() => {
    loadActive('target_weight');
    loadAiConfigStatus();
  }, []);

  // 加载 AI 配置状态
  const loadAiConfigStatus = async () => {
    try {
      const config = await aiConfigQueries.getActive();
      if (config) {
        setAiConfigured(true);
        setAiEndpoint(config.apiEndpoint || '');
      } else {
        setAiConfigured(false);
        setAiEndpoint('');
      }
    } catch (error) {
      console.error('Failed to load AI config status:', error);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    Alert.alert(
      t('settings.language.title'),
      `${t('settings.language.current')}: ${supportedLocales.find(l => l.code === newLocale)?.nativeName}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => setLocale(newLocale),
        },
      ]
    );
  };

  // 导出数据
  const handleExport = async () => {
    Alert.alert(
      t('settings.data.export'),
      t('settings.data.exportConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              setIsExporting(true);
              await dataTransferService.exportData();
              Alert.alert(t('common.success'), t('settings.data.exportSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.data.exportFailed'));
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  // 导入数据
  const handleImport = async () => {
    Alert.alert(
      t('settings.data.import'),
      t('settings.data.importConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              setIsImporting(true);
              const result = await dataTransferService.importData();
              Alert.alert(
                t('common.success'),
                `${t('settings.data.importSuccess')}\n\n` +
                `${t('diet.title')}: ${result.counts.dietRecords}\n` +
                `${t('exercise.title')}: ${result.counts.exerciseRecords}\n` +
                `${t('weight.title')}: ${result.counts.weightRecords}`
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : t('settings.data.importFailed');
              Alert.alert(t('common.error'), message);
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 目标设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.goals.title')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/goals')}
          >
            <View style={styles.menuLeft}>
              <Icon name="weight" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.goals.targetWeight')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>
                {activeGoal ? `${activeGoal.targetValue} kg` : t('settings.goals.notSet')}
              </Text>
              <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* AI 配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.ai.title')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/ai-config')}
          >
            <View style={styles.menuLeft}>
              <Icon name="ai" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.ai.config')}</Text>
            </View>
            <View style={styles.menuRight}>
              {aiConfigured ? (
                <View style={styles.statusBadge}>
                  <CheckIcon size={12} color={theme.colors.success} />
                  <Text style={styles.statusText}>{t('settings.ai.configured')}</Text>
                </View>
              ) : (
                <Text style={styles.menuValue}>{t('settings.ai.notConfigured')}</Text>
              )}
              <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
            </View>
          </TouchableOpacity>
          {aiConfigured && aiEndpoint && (
            <View style={styles.menuItemDetail}>
              <Text style={styles.detailText} numberOfLines={1}>
                {aiEndpoint}
              </Text>
            </View>
          )}
        </View>

        {/* 健康数据 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.health.title')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/health-connect')}
          >
            <View style={styles.menuLeft}>
              <Icon name="connected" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.health.healthConnect')}</Text>
            </View>
            <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* 语言设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language.title')}</Text>
          {supportedLocales.map((loc) => (
            <TouchableOpacity
              key={loc.code}
              style={styles.menuItem}
              onPress={() => handleLanguageChange(loc.code)}
            >
              <View style={styles.menuLeft}>
                <Icon name="settings" size={20} color={theme.colors.primary.main} />
                <Text style={styles.menuLabel}>{loc.nativeName}</Text>
              </View>
              {locale === loc.code && (
                <CheckIcon size={20} color={theme.colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 星期开始日 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.weekStart.title')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/week-start')}
          >
            <View style={styles.menuLeft}>
              <Icon name="calendar" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.weekStart.title')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>
                {WEEK_START_OPTIONS.find(o => o.value === weekStartDay)?.label}
              </Text>
              <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data.title')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleExport}
            disabled={isExporting}
          >
            <View style={styles.menuLeft}>
              <Icon name="chart-bar" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.data.export')}</Text>
            </View>
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.primary.main} />
            ) : (
              <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleImport}
            disabled={isImporting}
          >
            <View style={styles.menuLeft}>
              <Icon name="chart-bar" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.data.import')}</Text>
            </View>
            {isImporting ? (
              <ActivityIndicator size="small" color={theme.colors.primary.main} />
            ) : (
              <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
            )}
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about.title')}</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/about')}
          >
            <View style={styles.menuLeft}>
              <Icon name="help" size={20} color={theme.colors.primary.main} />
              <Text style={styles.menuLabel}>{t('settings.about.version')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>1.0.0</Text>
              <ArrowRightIcon size={16} color={theme.colors.text.tertiary} />
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.success,
  },
  menuItemDetail: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  detailText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
});
