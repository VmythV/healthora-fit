// app/settings/health-connect.tsx
// 健康数据连接页面

import { logger } from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useHealthData } from '@/hooks/useHealthData';
import { HealthConnectionStatus } from '@/services/health';
import { Icon, BackIcon, CheckIcon, CloseIcon } from '@/components/icons';
import { showNotification, showConfirm } from '@/components/ui';

export default function HealthConnectScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const {
    connectionStatus,
    permissions,
    isLoading,
    error,
    checkAvailability,
    requestPermissions,
    getConnectionStatus,
    syncData,
    disconnect,
  } = useHealthData();

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      await getConnectionStatus();
    } catch (error) {
      logger.error('[Health] Failed to load health status:', error);
    }
  };

  // 连接健康平台
  const handleConnect = async () => {
    try {
      // 检查可用性
      const available = await checkAvailability();
      if (!available) {
        showNotification(t('settings.health.notAvailable'), 'error');
        return;
      }

      // 请求权限
      const perms = await requestPermissions();
      if (perms.readWeight && perms.readExercise) {
        showNotification(t('settings.health.connectedSuccess'), 'success');
      } else {
        showNotification(t('settings.health.partialPermission'), 'warning');
      }
    } catch (error) {
      showNotification(t('settings.health.connectFailed'), 'error');
    }
  };

  // 同步数据
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncData();

      if (result.success) {
        showNotification(
          `${t('settings.health.syncSuccess')} - ${t('weight.title')}: ${result.counts.weight}, ${t('exercise.title')}: ${result.counts.exercise}`,
          'success'
        );
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification(t('settings.health.syncFailed'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 断开连接
  const handleDisconnect = async () => {
    const ok = await showConfirm({
      title: t('settings.health.disconnect'),
      message: t('settings.health.disconnectConfirm'),
      type: 'danger',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });
    if (ok) {
      try {
        await disconnect();
        showNotification(t('settings.health.disconnectedSuccess'), 'success');
      } catch (error) {
        showNotification(t('settings.health.disconnectFailed'), 'error');
      }
    }
  };

  // 获取状态颜色
  const getStatusColor = (connected: boolean) => {
    return connected ? theme.colors.success : theme.colors.text.tertiary;
  };

  // 获取状态文本
  const getStatusText = (status: HealthConnectionStatus | null) => {
    if (!status) return t('settings.health.notConnected');
    return status.isConnected ? t('settings.health.connected') : t('settings.health.notConnected');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.health.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 连接状态卡片 */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Icon
                name={connectionStatus?.isConnected ? 'connected' : 'disconnected'}
                size={24}
                color={connectionStatus?.isConnected ? theme.colors.success : theme.colors.text.tertiary}
              />
            </View>
            <Text style={styles.statusTitle}>
              {getStatusText(connectionStatus)}
            </Text>
          </View>

          {connectionStatus?.platform && (
            <Text style={styles.platformName}>
              {t('settings.health.platform')}: {connectionStatus.platform}
            </Text>
          )}

          {connectionStatus?.lastSyncDate && (
            <Text style={styles.lastSync}>
              {t('settings.health.lastSync')}: {new Date(connectionStatus.lastSyncDate).toLocaleString()}
            </Text>
          )}

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionsCard}>
          {!connectionStatus?.isConnected ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.connectButton]}
              onPress={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>{t('settings.health.connect')}</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.syncButton]}
                onPress={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>{t('settings.health.sync')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.disconnectButton]}
                onPress={handleDisconnect}
                disabled={isLoading}
              >
                <Text style={styles.disconnectButtonText}>{t('settings.health.disconnect')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 权限信息 */}
        {permissions && (
          <View style={styles.permissionsCard}>
            <Text style={styles.sectionTitle}>{t('settings.health.permissions')}</Text>

            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>{t('settings.health.readWeight')}</Text>
              {permissions.readWeight
                ? <CheckIcon size={20} color={theme.colors.success} />
                : <CloseIcon size={20} color={theme.colors.error} />
              }
            </View>

            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>{t('settings.health.readExercise')}</Text>
              {permissions.readExercise
                ? <CheckIcon size={20} color={theme.colors.success} />
                : <CloseIcon size={20} color={theme.colors.error} />
              }
            </View>

            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>{t('settings.health.writeWeight')}</Text>
              {permissions.writeWeight
                ? <CheckIcon size={20} color={theme.colors.success} />
                : <CloseIcon size={20} color={theme.colors.error} />
              }
            </View>

            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>{t('settings.health.writeExercise')}</Text>
              {permissions.writeExercise
                ? <CheckIcon size={20} color={theme.colors.success} />
                : <CloseIcon size={20} color={theme.colors.error} />
              }
            </View>
          </View>
        )}

        {/* 帮助信息 */}
        <View style={styles.helpCard}>
          <View style={styles.helpTitleRow}>
            <Icon name="help" size={18} color={theme.colors.text.primary} />
            <Text style={styles.helpTitle}>{t('settings.health.help')}</Text>
          </View>
          <Text style={styles.helpText}>{t('settings.health.helpText1')}</Text>
          <Text style={styles.helpText}>{t('settings.health.helpText2')}</Text>
          <Text style={styles.helpText}>{t('settings.health.helpText3')}</Text>
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
  statusCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  statusIconContainer: {
    marginRight: theme.spacing.base,
  },
  statusTitle: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  platformName: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  lastSync: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  errorText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  actionsCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  connectButton: {
    backgroundColor: theme.colors.primary.main,
  },
  syncButton: {
    backgroundColor: theme.colors.info,
  },
  disconnectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: '#FFFFFF',
  },
  disconnectButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },
  permissionsCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.base,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  permissionLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  permissionStatus: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.bold,
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
});
