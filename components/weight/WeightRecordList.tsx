// components/weight/WeightRecordList.tsx
// 体重记录列表

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { WeightRecord } from '@/types/weight';
import { Card, Empty } from '@/components/ui';
import { Icon } from '@/components/icons';

interface WeightRecordListProps {
  onRecordPress?: (record: WeightRecord) => void;
}

/**
 * 体重记录列表
 */
export function WeightRecordList({ onRecordPress }: WeightRecordListProps) {
  const { t } = useI18n();
  const { records, loading, deleteRecord } = useWeightRecords();

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('common.today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('common.yesterday');
    }
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算趋势
  const getTrend = (index: number) => {
    if (index >= records.length - 1) return null;
    const current = records[index].weight;
    const previous = records[index + 1].weight;
    const diff = current - previous;
    if (diff > 0) return { icon: '↑', color: theme.colors.error, diff };
    if (diff < 0) return { icon: '↓', color: theme.colors.success, diff };
    return { icon: '→', color: theme.colors.text.tertiary, diff: 0 };
  };

  // 删除记录
  const handleDelete = (id: number) => {
    Alert.alert(
      t('confirm.delete.title'),
      t('confirm.delete.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteRecord(id),
        },
      ]
    );
  };

  // 渲染记录项
  const renderItem = ({ item, index }: { item: WeightRecord; index: number }) => {
    const trend = getTrend(index);

    return (
      <TouchableOpacity
        onPress={() => onRecordPress?.(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <View style={styles.dateInfo}>
              <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
            <View style={styles.weightInfo}>
              <Text style={styles.weightValue}>{item.weight.toFixed(1)}</Text>
              <Text style={styles.weightUnit}>{t('weight.kg')}</Text>
            </View>
          </View>

          {/* 趋势和详情 */}
          <View style={styles.detailRow}>
            {trend && (
              <Text style={[styles.trendText, { color: trend.color }]}>
                {trend.icon} {Math.abs(trend.diff).toFixed(1)} {t('weight.kg')}
              </Text>
            )}
            {item.note && (
              <View style={styles.noteContainer}>
                <Icon name="note" size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.noteText} numberOfLines={1}>
                  {' '}{item.note}
                </Text>
              </View>
            )}
          </View>

          {/* 删除按钮 */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Icon name="delete" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </Card>
      </TouchableOpacity>
    );
  };

  // 空状态
  if (!loading && records.length === 0) {
    return (
      <Empty
        icon="weight"
        title={t('weight.noRecord')}
        description={t('common.comingSoon')}
      />
    );
  }

  return (
    <FlatList
      data={records}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  recordCard: {
    padding: theme.spacing.base,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  date: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  time: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  weightInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  weightValue: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  weightUnit: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  trendText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  noteText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
});
