// components/exercise/ExerciseRecordDetail.tsx
// 运动记录详情

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { ExerciseRecord } from '@/types/exercise';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';

interface ExerciseRecordDetailProps {
  record: ExerciseRecord;
  onDelete?: () => void;
}

// 运动类型图标
const EXERCISE_ICONS: Record<string, string> = {
  running: '🏃',
  walking: '🚶',
  cycling: '🚴',
  swimming: '🏊',
  strength: '💪',
  yoga: '🧘',
  hiit: '⚡',
  other: '🎯',
};

/**
 * 运动记录详情
 */
export function ExerciseRecordDetail({ record, onDelete }: ExerciseRecordDetailProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { deleteRecord } = useExerciseRecords();

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 编辑
  const handleEdit = () => {
    router.push({
      pathname: '/exercise/record',
      params: {
        recordId: record.id,
        exerciseType: record.exerciseType,
        duration: record.durationMinutes,
        calories: record.caloriesBurned,
        distance: record.distanceKm,
        note: record.note,
      },
    });
  };

  // 删除
  const handleDelete = () => {
    Alert.alert(
      t('confirm.delete.title'),
      t('confirm.delete.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecord(record.id);
              onDelete?.();
            } catch (error) {
              Alert.alert(t('common.error'), t('error.saveFailed'));
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 头部信息 */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>
              {EXERCISE_ICONS[record.exerciseType] || '🎯'}
            </Text>
            <Text style={styles.typeName}>
              {t(`exerciseType.${record.exerciseType}`)}
            </Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.date}>{formatDate(record.timestamp)}</Text>
            <Text style={styles.time}>{formatTime(record.timestamp)}</Text>
          </View>
        </View>
      </Card>

      {/* 统计数据 */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{record.durationMinutes}</Text>
          <Text style={styles.statLabel}>{t('exercise.minutes')}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{record.caloriesBurned || 0}</Text>
          <Text style={styles.statLabel}>{t('home.kcal')}</Text>
        </Card>
        {record.distanceKm ? (
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{record.distanceKm}</Text>
            <Text style={styles.statLabel}>{t('exercise.km')}</Text>
          </Card>
        ) : null}
      </View>

      {/* 详细信息 */}
      <Card style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('exercise.exerciseType')}</Text>
          <Text style={styles.detailValue}>
            {t(`exerciseType.${record.exerciseType}`)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('exercise.duration')}</Text>
          <Text style={styles.detailValue}>{record.durationMinutes} {t('exercise.minutes')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('exercise.caloriesBurned')}</Text>
          <Text style={styles.detailValue}>{record.caloriesBurned || 0} {t('home.kcal')}</Text>
        </View>
        {record.distanceKm ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('exercise.distance')}</Text>
            <Text style={styles.detailValue}>{record.distanceKm} {t('exercise.km')}</Text>
          </View>
        ) : null}
        {record.heartRateAvg ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('exercise.heartRate')}</Text>
            <Text style={styles.detailValue}>{record.heartRateAvg} {t('exercise.bpm')}</Text>
          </View>
        ) : null}
      </Card>

      {/* 备注 */}
      {record.note && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.note')}</Text>
          <Card style={styles.noteCard}>
            <Text style={styles.noteText}>{record.note}</Text>
          </Card>
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Icon name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Icon name="delete" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerCard: {
    margin: theme.spacing.xl,
    padding: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  typeIcon: {
    fontSize: 36,
  },
  typeName: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  time: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  detailCard: {
    margin: theme.spacing.xl,
    padding: theme.spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  detailLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  noteCard: {
    padding: theme.spacing.base,
  },
  noteText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.primary.main,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  editButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  deleteButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
