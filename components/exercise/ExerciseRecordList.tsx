// components/exercise/ExerciseRecordList.tsx
// 运动记录列表
//
// P1-8 优化：
// - 模块顶层 helper（formatTime、EXERCISE_ICONS）
// - 行级 ExerciseRow 提取为 React.memo 组件
// - renderItem / keyExtractor / handleDelete 改 useCallback

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { ExerciseRecord } from '@/types/exercise';
import { Card, Empty } from '@/components/ui';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';
import { showConfirm } from '@/components/ui';

interface ExerciseRecordListProps {
  date?: string;
  onRecordPress?: (record: ExerciseRecord) => void;
}

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

// 模块级 helper
function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function getExerciseIcon(type: string): IconName {
  return EXERCISE_ICONS[type] || 'other-exercise';
}

// 行级组件 —— React.memo 防止同 props 重复渲染
interface ExerciseRowProps {
  item: ExerciseRecord;
  minutesLabel: string;
  kcalLabel: string;
  kmLabel: string;
  exerciseTypeName: string;
  onPress?: (record: ExerciseRecord) => void;
  onDelete: (id: number) => void;
}

const ExerciseRow = React.memo(function ExerciseRow({
  item,
  minutesLabel,
  kcalLabel,
  kmLabel,
  exerciseTypeName,
  onPress,
  onDelete,
}: ExerciseRowProps) {
  const handlePress = useCallback(() => onPress?.(item), [item, onPress]);
  const handleDelete = useCallback(() => onDelete(item.id), [item.id, onDelete]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <View style={styles.typeRow}>
              <View style={styles.typeIconContainer}>
                <Icon
                  name={getExerciseIcon(item.exerciseType)}
                  size={24}
                  color={theme.colors.primary.main}
                />
              </View>
              <Text style={styles.typeName}>{exerciseTypeName}</Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.recordStats}>
            <Text style={styles.durationValue}>{item.durationMinutes}</Text>
            <Text style={styles.durationUnit}>{minutesLabel}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="fire" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>
              {' '}{item.caloriesBurned || 0} {kcalLabel}
            </Text>
          </View>
          {item.distanceKm ? (
            <View style={styles.detailItem}>
              <Icon name="chart-bar" size={14} color={theme.colors.text.secondary} />
              <Text style={styles.detailText}>
                {' '}{item.distanceKm} {kmLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
});

export function ExerciseRecordList({ date, onRecordPress }: ExerciseRecordListProps) {
  const { t } = useI18n();
  const { records, loading, deleteRecord } = useExerciseRecords(date);

  const handleDelete = useCallback(
    async (id: number) => {
      const ok = await showConfirm({
        title: t('confirm.delete.title'),
        message: t('confirm.delete.message'),
        type: 'danger',
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
      });
      if (ok) deleteRecord(id);
    },
    [t, deleteRecord]
  );

  const renderItem: ListRenderItem<ExerciseRecord> = useCallback(
    ({ item }) => (
      <ExerciseRow
        item={item}
        minutesLabel={t('exercise.minutes')}
        kcalLabel={t('home.kcal')}
        kmLabel={t('exercise.km')}
        exerciseTypeName={t(`exerciseType.${item.exerciseType}`)}
        onPress={onRecordPress}
        onDelete={handleDelete}
      />
    ),
    [t, onRecordPress, handleDelete]
  );

  const keyExtractor = useCallback((item: ExerciseRecord) => item.id.toString(), []);

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
      keyExtractor={keyExtractor}
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
