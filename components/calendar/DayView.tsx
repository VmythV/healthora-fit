// components/calendar/DayView.tsx
// 日视图组件 - 时间轴形式

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { Card, Modal } from '@/components/ui';
import { DietRecordDetail } from '@/components/diet/DietRecordDetail';
import { ExerciseRecordDetail } from '@/components/exercise/ExerciseRecordDetail';
import { DietRecord } from '@/types/diet';
import { ExerciseRecord } from '@/types/exercise';
import { Timeline } from './Timeline';
import { TimelineItemData } from './TimelineItem';

interface DayViewProps {
  date: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  onDateChange?: (date: string) => void;
}

/**
 * 日视图组件
 * 日期导航 + 统计行 + 时间轴记录列表 + 详情弹窗
 */
export function DayView({ date, maxDate, onDateChange }: DayViewProps) {
  const { t } = useI18n();

  // 动画值
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  // 详情弹窗
  const [selectedItem, setSelectedItem] = useState<TimelineItemData | null>(null);

  // 判断是否可以跳转到下一天
  const canGoNextDay = useCallback(() => {
    if (!maxDate) return true;
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    const nextDayStr = d.toISOString().split('T')[0];
    return nextDayStr <= maxDate;
  }, [date, maxDate]);

  // 上一天
  const handlePrevDay = useCallback(() => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onDateChange?.(d.toISOString().split('T')[0]);
  }, [date, onDateChange]);

  // 下一天
  const handleNextDay = useCallback(() => {
    if (!canGoNextDay()) return;
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onDateChange?.(d.toISOString().split('T')[0]);
  }, [date, onDateChange, canGoNextDay]);

  // 滑动手势
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      const maxTranslation = 30;
      const clampedTranslation = Math.max(
        -maxTranslation,
        Math.min(maxTranslation, event.translationX * 0.3)
      );
      translateX.value = clampedTranslation;
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      const threshold = 20;
      if (event.translationX < -threshold) {
        runOnJS(handleNextDay)();
      } else if (event.translationX > threshold) {
        runOnJS(handlePrevDay)();
      }
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });
    });

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 获取指定日期的数据
  const { records: dietRecords } = useDietRecords(date);
  const { records: exerciseRecords } = useExerciseRecords(date);

  // 格式化日期显示
  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return t('common.today');
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return t('common.yesterday');
    }
    return d.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // 点击时间轴项
  const handleItemPress = useCallback((item: TimelineItemData) => {
    setSelectedItem(item);
  }, []);

  // 删除记录后的回调
  const handleDetailDelete = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // 计算今日统计
  const totalCalories = dietRecords.reduce((sum, r) => sum + (r.totalCalories || 0), 0);
  const totalExerciseCalories = exerciseRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0);
  const totalMinutes = exerciseRecords.reduce((sum, r) => sum + r.durationMinutes, 0);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* 日期导航 */}
        <View style={styles.dateHeader}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateTitle}>{formatDateDisplay(date)}</Text>
          <TouchableOpacity
            onPress={handleNextDay}
            style={[styles.navButton, !canGoNextDay() && styles.navButtonDisabled]}
            disabled={!canGoNextDay()}
          >
            <Text style={[styles.navText, !canGoNextDay() && styles.navTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 今日统计 */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalCalories + totalExerciseCalories}</Text>
            <Text style={styles.statLabel}>{t('home.kcal')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>{t('home.minutes')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {dietRecords.length + exerciseRecords.length}
            </Text>
            <Text style={styles.statLabel}>{t('calendar.status')}</Text>
          </Card>
        </View>

        {/* 时间轴 */}
        <Timeline
          dietRecords={dietRecords}
          exerciseRecords={exerciseRecords}
          onItemPress={handleItemPress}
        />

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
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  navText: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.light,
  },
  dateTitle: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.base,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navTextDisabled: {
    color: theme.colors.text.tertiary,
  },
  modalContent: {
    maxHeight: 400,
  },
});
