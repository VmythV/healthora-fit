// components/calendar/DayDetail.tsx
// 日详情组件 - 统计行 + 时间轴 + 详情弹窗（无日期导航）

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { Modal } from '@/components/ui';
import { DietRecordDetail } from '@/components/diet/DietRecordDetail';
import { ExerciseRecordDetail } from '@/components/exercise/ExerciseRecordDetail';
import { DietRecord } from '@/types/diet';
import { ExerciseRecord } from '@/types/exercise';
import { Timeline } from './Timeline';
import { TimelineItemData } from './TimelineItem';

interface DayDetailProps {
  date: string;
  maxDate?: string;
  onScroll?: any;
  bottomSpacer?: number;
  onScrollEndDrag?: any;
  onMomentumScrollEnd?: any;
  scrollRef?: any;
}

/**
 * 日详情组件
 * 展示选定日期的统计摘要 + 时间轴记录列表
 * 顶部留白由父容器提供（随日历折叠动画收缩）
 */
export function DayDetail({
  date,
  onScroll,
  bottomSpacer,
  onScrollEndDrag,
  onMomentumScrollEnd,
  scrollRef,
}: DayDetailProps) {
  const { t } = useI18n();

  const [selectedItem, setSelectedItem] = useState<TimelineItemData | null>(null);

  const { records: dietRecords } = useDietRecords(date);
  const { records: exerciseRecords } = useExerciseRecords(date);

  // 计算统计
  const { totalCalories, totalExerciseCalories, netCalories } = useMemo(() => {
    const cal = dietRecords.reduce((sum, r) => sum + (r.totalCalories || 0), 0);
    const exerciseCal = exerciseRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0);
    return {
      totalCalories: cal,
      totalExerciseCalories: exerciseCal,
      netCalories: cal - exerciseCal,
    };
  }, [dietRecords, exerciseRecords]);

  // 格式化日期
  const dateLabel = useMemo(() => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return t('common.today');
    if (d.toDateString() === yesterday.toDateString()) return t('common.yesterday');
    return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  }, [date, t]);

  const handleItemPress = useCallback((item: TimelineItemData) => {
    setSelectedItem(item);
  }, []);

  const handleDetailDelete = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* 日期标签 + 统计 */}
      <View style={styles.summarySection}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardIn]}>
            <Text style={styles.statLabel}>{t('calendar.caloriesIn')}</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>{totalCalories}</Text>
              <Text style={styles.statUnit}>{t('home.kcal')}</Text>
            </View>
          </View>
          <View style={[styles.statCard, styles.statCardOut]}>
            <Text style={styles.statLabel}>{t('calendar.caloriesOut')}</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: theme.colors.primary.main }]}>{totalExerciseCalories}</Text>
              <Text style={styles.statUnit}>{t('home.kcal')}</Text>
            </View>
          </View>
          <View style={[styles.statCard, styles.statCardNet]}>
            <Text style={styles.statLabel}>{t('calendar.caloriesNet')}</Text>
            <View style={styles.statValueRow}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      netCalories > 0
                        ? theme.colors.warning
                        : netCalories < 0
                        ? theme.colors.primary.main
                        : theme.colors.text.secondary,
                  },
                ]}
              >
                {netCalories > 0 ? `+${netCalories}` : netCalories}
              </Text>
              <Text style={styles.statUnit}>{t('home.kcal')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 时间轴 */}
      <View style={styles.timelineSection}>
        <Timeline
          dietRecords={dietRecords}
          exerciseRecords={exerciseRecords}
          onItemPress={handleItemPress}
          onScroll={onScroll}
          bottomSpacer={bottomSpacer}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollRef={scrollRef}
        />
      </View>

      {/* 详情 Modal */}
      <Modal
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        type="bottom"
        title={
          selectedItem?.type === 'diet'
            ? t('timeline.dietDetail')
            : t('timeline.exerciseDetail')
        }
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {selectedItem?.type === 'diet' ? (
            <DietRecordDetail
              record={selectedItem.record as DietRecord}
              onDelete={handleDetailDelete}
            />
          ) : selectedItem?.type === 'exercise' ? (
            <ExerciseRecordDetail
              record={selectedItem.record as ExerciseRecord}
              onDelete={handleDetailDelete}
            />
          ) : null}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summarySection: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  dateLabel: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    borderLeftWidth: 3,
  },
  statCardIn: {
    borderLeftColor: theme.colors.warning,
  },
  statCardOut: {
    borderLeftColor: theme.colors.primary.main,
  },
  statCardNet: {
    borderLeftColor: theme.colors.border.main,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statValue: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.bold,
  },
  statUnit: {
    fontSize: theme.fontSize.tiny,
    color: theme.colors.text.tertiary,
    fontWeight: theme.fontWeight.medium,
  },
  timelineSection: {
    flex: 1,
  },
  modalContent: {
    maxHeight: 400,
  },
});
