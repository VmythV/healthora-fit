// components/calendar/DayView.tsx
// 日视图组件

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { Card, Empty } from '@/components/ui';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';

interface DayViewProps {
  date: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD，最大可选日期
  onDateChange?: (date: string) => void;
}

// 记录类型图标
const RECORD_ICONS: Record<string, IconName> = {
  diet: 'bowl',
  exercise: 'running',
  weight: 'weight',
};

/**
 * 日视图组件
 */
export function DayView({ date, maxDate, onDateChange }: DayViewProps) {
  const { t } = useI18n();
  const router = useRouter();

  // 动画值
  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

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
      // 限制滑动幅度，最大为 30px
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
        // 向左滑动，切换到下一天
        runOnJS(handleNextDay)();
      } else if (event.translationX > threshold) {
        // 向右滑动，切换到上一天
        runOnJS(handlePrevDay)();
      }
      // 平滑回弹动画
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

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // 合并所有记录并按时间排序
  const allRecords = [
    ...dietRecords.map(r => ({
      id: r.id,
      type: 'diet' as const,
      time: r.timestamp,
      title: r.mealType ? t(`mealType.${r.mealType}`) : t('record.diet.title'),
      detail: `${r.totalCalories || 0} ${t('home.kcal')}`,
      onPress: () => {}, // TODO: 跳转详情
    })),
    ...exerciseRecords.map(r => ({
      id: r.id,
      type: 'exercise' as const,
      time: r.timestamp,
      title: t(`exerciseType.${r.exerciseType}`),
      detail: `${r.durationMinutes} ${t('home.minutes')}`,
      onPress: () => {}, // TODO: 跳转详情
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // 计算今日统计
  const totalCalories = dietRecords.reduce((sum, r) => sum + (r.totalCalories || 0), 0);
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
            <Text style={styles.statValue}>{totalCalories}</Text>
            <Text style={styles.statLabel}>{t('home.kcal')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>{t('home.minutes')}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{allRecords.length}</Text>
            <Text style={styles.statLabel}>{t('calendar.status')}</Text>
          </Card>
        </View>

        {/* 记录列表 */}
        <ScrollView style={styles.recordList}>
          {allRecords.length === 0 ? (
            <Empty
              icon="note"
              title={t('common.noData')}
              description={t('common.comingSoon')}
            />
          ) : (
            allRecords.map((record) => (
              <TouchableOpacity
                key={`${record.type}-${record.id}`}
                onPress={record.onPress}
                activeOpacity={0.7}
              >
                <Card style={styles.recordCard}>
                  <View style={styles.recordRow}>
                    <View style={styles.recordIconContainer}>
                      <Icon name={RECORD_ICONS[record.type]} size={24} color={theme.colors.primary.main} />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>{record.title}</Text>
                      <Text style={styles.recordDetail}>{record.detail}</Text>
                    </View>
                    <Text style={styles.recordTime}>
                      {formatTime(record.time)}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
    marginBottom: theme.spacing.lg,
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
  recordList: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  recordCard: {
    padding: theme.spacing.base,
    marginBottom: theme.spacing.sm,
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
  navButtonDisabled: {
    opacity: 0.3,
  },
  navTextDisabled: {
    color: theme.colors.text.tertiary,
  },
});
