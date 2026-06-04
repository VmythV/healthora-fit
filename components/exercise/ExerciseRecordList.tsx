// components/exercise/ExerciseRecordList.tsx
// 运动记录列表

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { ExerciseRecord } from '@/types/exercise';
import { Card, Empty } from '@/components/ui';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';

interface ExerciseRecordListProps {
  date?: string;
  onRecordPress?: (record: ExerciseRecord) => void;
}

// 运动类型图标
const EXERCISE_ICONS: Record<string, IconName> = {
  running: 'running',
  walking: 'walking',
  cycling: 'cycling',
  swimming: 'swimming',
  strength: 'strength',
  yoga: 'yoga',
  hiit: 'hiit',
  other: 'other-exercise',
};

/**
 * 运动记录列表
 */
export function ExerciseRecordList({ date, onRecordPress }: ExerciseRecordListProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { records, loading, deleteRecord } = useExerciseRecords(date);

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
  const renderItem = ({ item }: { item: ExerciseRecord }) => (
    <TouchableOpacity
      onPress={() => onRecordPress?.(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <View style={styles.typeRow}>
              <View style={styles.typeIconContainer}>
                <Icon name={EXERCISE_ICONS[item.exerciseType] || 'other-exercise'} size={24} color={theme.colors.primary.main} />
              </View>
              <Text style={styles.typeName}>
                {t(`exerciseType.${item.exerciseType}`)}
              </Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.recordStats}>
            <Text style={styles.durationValue}>{item.durationMinutes}</Text>
            <Text style={styles.durationUnit}>{t('exercise.minutes')}</Text>
          </View>
        </View>

        {/* 详细数据 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="fire" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>
              {' '}{item.caloriesBurned || 0} {t('home.kcal')}
            </Text>
          </View>
          {item.distanceKm ? (
            <View style={styles.detailItem}>
              <Icon name="chart-bar" size={14} color={theme.colors.text.secondary} />
              <Text style={styles.detailText}>
                {' '}{item.distanceKm} {t('exercise.km')}
              </Text>
            </View>
          ) : null}
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

  // 空状态
  if (!loading && records.length === 0) {
    return (
      <Empty
        icon="running"
        title={t('exercise.noRecords')}
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
  recordInfo: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  typeIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeName: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  time: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  durationValue: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  durationUnit: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
});
