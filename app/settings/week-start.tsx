// app/settings/week-start.tsx
// 星期开始日设置页面

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useWeekStartDay, WEEK_START_OPTIONS } from '@/hooks/useWeekStartDay';
import { Icon } from '@/components/icons';

/**
 * 星期开始日设置页面
 */
export default function WeekStartScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { weekStartDay, setWeekStartDay } = useWeekStartDay();

  const handleSelect = async (day: number) => {
    await setWeekStartDay(day);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.weekStart.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 选项列表 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionHint}>{t('settings.weekStart.hint')}</Text>
          {WEEK_START_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.menuItem}
              onPress={() => handleSelect(option.value)}
            >
              <View style={styles.menuLeft}>
                <Icon name="calendar" size={20} color={theme.colors.primary.main} />
                <Text style={styles.menuLabel}>{t(`settings.weekStart.days.${option.value}`)}</Text>
              </View>
              {weekStartDay === option.value && (
                <Icon name="checkmark" size={20} color={theme.colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionHint: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
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
});
