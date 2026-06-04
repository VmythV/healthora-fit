// components/home/TodayRecords.tsx
// 今日记录列表

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Card, Empty } from '@/components/ui';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';

interface Record {
  id: number;
  type: 'diet' | 'exercise' | 'weight';
  time: string;
  title: string;
  detail: string;
}

interface TodayRecordsProps {
  records: Record[];
}

// 记录类型图标
const RECORD_ICONS: { [key: string]: IconName } = {
  diet: 'bowl',
  exercise: 'running',
  weight: 'weight',
};

/**
 * 今日记录列表
 */
export function TodayRecords({ records }: TodayRecordsProps) {
  const { t } = useI18n();
  const router = useRouter();

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 点击记录
  const handlePress = (record: Record) => {
    switch (record.type) {
      case 'diet':
        // TODO: 跳转到饮食记录详情
        break;
      case 'exercise':
        // TODO: 跳转到运动记录详情
        break;
      case 'weight':
        // TODO: 跳转到体重记录详情
        break;
    }
  };

  if (records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Icon name="note" size={48} color={theme.colors.text.tertiary} />
        </View>
        <Text style={styles.emptyText}>{t('common.noData')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {records.map((record, index) => (
        <TouchableOpacity
          key={`${record.type}-${record.id}`}
          onPress={() => handlePress(record)}
          activeOpacity={0.7}
        >
          <Card style={styles.recordCard} shadow="none">
            <View style={styles.recordRow}>
              <View style={styles.recordIconContainer}>
                <Icon name={RECORD_ICONS[record.type]} size={24} color={theme.colors.primary.main} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDetail}>{record.detail}</Text>
              </View>
              <Text style={styles.recordTime}>{formatTime(record.time)}</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  emptyIconContainer: {
    marginBottom: theme.spacing.base,
  },
  emptyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
  recordCard: {
    padding: theme.spacing.base,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  recordIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  recordDetail: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  recordTime: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
});
