// app/settings/about.tsx
// 关于页面

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Icon } from '@/components/icons';

export default function AboutScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const appInfo = {
    name: 'Healthora Fit',
    version: '1.0.0',
    buildNumber: '1',
    description: t('settings.about.description'),
    developer: 'Healthora Team',
    website: 'https://healthora.app',
    email: 'support@healthora.app',
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.about.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Logo 和名称 */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="exercise" size={64} color={theme.colors.primary.main} />
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </View>

        {/* 版本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about.versionInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.version')}</Text>
            <Text style={styles.infoValue}>{appInfo.version}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.buildNumber')}</Text>
            <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
          </View>
        </View>

        {/* 开发者信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about.developer')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.team')}</Text>
            <Text style={styles.infoValue}>{appInfo.developer}</Text>
          </View>
        </View>

        {/* 联系方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about.contact')}</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openLink(appInfo.website)}
          >
            <Text style={styles.linkLabel}>{t('settings.about.website')}</Text>
            <Text style={styles.linkValue}>{appInfo.website}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openLink(`mailto:${appInfo.email}`)}
          >
            <Text style={styles.linkLabel}>{t('settings.about.email')}</Text>
            <Text style={styles.linkValue}>{appInfo.email}</Text>
          </TouchableOpacity>
        </View>

        {/* 功能特性 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about.features')}</Text>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="bowl" size={20} color={theme.colors.primary.main} />
            </View>
            <Text style={styles.featureText}>{t('settings.about.feature1')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="running" size={20} color={theme.colors.primary.main} />
            </View>
            <Text style={styles.featureText}>{t('settings.about.feature2')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="weight" size={20} color={theme.colors.primary.main} />
            </View>
            <Text style={styles.featureText}>{t('settings.about.feature3')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="chart-bar" size={20} color={theme.colors.primary.main} />
            </View>
            <Text style={styles.featureText}>{t('settings.about.feature4')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="ai" size={20} color={theme.colors.primary.main} />
            </View>
            <Text style={styles.featureText}>{t('settings.about.feature5')}</Text>
          </View>
        </View>

        {/* 版权信息 */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 {appInfo.developer}
          </Text>
          <Text style={styles.copyrightText}>
            {t('settings.about.allRightsReserved')}
          </Text>
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
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    backgroundColor: theme.colors.background.primary,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: theme.fontSize.h1,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  appDescription: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  section: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  infoLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  linkLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  linkValue: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primary.main,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  featureIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.base,
  },
  featureText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  copyrightText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
});
