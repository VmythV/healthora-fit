// components/calendar/Timeline.tsx
// 时间轴组件

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { DietRecord } from '@/types/diet';
import { ExerciseRecord } from '@/types/exercise';
import { Empty } from '@/components/ui';
import { TimelineItem, TimelineItemData } from './TimelineItem';
import { IconName } from '@/components/icons/Icon';

interface TimelineProps {
  dietRecords: DietRecord[];
  exerciseRecords: ExerciseRecord[];
  onItemPress: (item: TimelineItemData) => void;
  onScroll?: any;
  /** 额外底部留白，保证折叠位移期间最后一条仍可滚入可视区 */
  bottomSpacer?: number;
}

// 记录类型图标
const RECORD_ICONS: Record<string, IconName> = {
  diet: 'bowl',
  exercise: 'running',
};

/**
 * 时间轴组件
 * 左侧时间轴 + 右侧事件卡片，按时间升序排列
 */
export function Timeline({ dietRecords, exerciseRecords, onItemPress, onScroll, bottomSpacer = 0 }: TimelineProps) {
  const { t } = useI18n();

  // 格式化时间标签
  const formatTimeLabel = (timestamp: string): string => {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // 构建饮食记录的详情文本
  const buildDietDetail = (record: DietRecord): string => {
    const parts: string[] = [];
    if (record.totalCalories) {
      parts.push(`${record.totalCalories} ${t('home.kcal')}`);
    }
    if (record.totalProtein) {
      parts.push(`${t('diet.protein')} ${record.totalProtein}g`);
    }
    if (record.note) {
      parts.push(record.note);
    }
    // 尝试解析食物列表
    if (record.foodsJson) {
      try {
        const foods = JSON.parse(record.foodsJson);
        if (Array.isArray(foods) && foods.length > 0) {
          const foodNames = foods.slice(0, 3).map((f: any) => f.name).join(', ');
          parts.unshift(foodNames);
        }
      } catch {}
    }
    return parts.join(' · ');
  };

  // 构建运动记录的详情文本
  const buildExerciseDetail = (record: ExerciseRecord): string => {
    const parts: string[] = [];
    if (record.durationMinutes) {
      parts.push(`${record.durationMinutes} ${t('home.minutes')}`);
    }
    if (record.caloriesBurned) {
      parts.push(`${t('exercise.caloriesBurned')} ${record.caloriesBurned} ${t('home.kcal')}`);
    }
    if (record.distanceKm) {
      parts.push(`${record.distanceKm} ${t('exercise.km')}`);
    }
    if (record.note) {
      parts.push(record.note);
    }
    return parts.join(' · ');
  };

  // 合并并排序所有记录
  const timelineItems: TimelineItemData[] = useMemo(() => {
    const items: TimelineItemData[] = [];

    // 添加饮食记录
    dietRecords.forEach((record) => {
      const mealName = record.mealType
        ? t(`mealType.${record.mealType}`)
        : t('record.diet.title');
      items.push({
        id: `diet-${record.id}`,
        type: 'diet',
        time: record.timestamp,
        timeLabel: formatTimeLabel(record.timestamp),
        title: mealName,
        detail: buildDietDetail(record),
        iconName: RECORD_ICONS.diet,
        record,
      });
    });

    // 添加运动记录
    exerciseRecords.forEach((record) => {
      const typeName = t(`exerciseType.${record.exerciseType}`);
      items.push({
        id: `exercise-${record.id}`,
        type: 'exercise',
        time: record.timestamp,
        timeLabel: formatTimeLabel(record.timestamp),
        title: typeName,
        detail: buildExerciseDetail(record),
        iconName: RECORD_ICONS.exercise,
        record,
      });
    });

    // 按时间升序排列
    items.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    return items;
  }, [dietRecords, exerciseRecords, t]);

  if (timelineItems.length === 0) {
    return (
      <Empty
        icon="note"
        title={t('common.noData')}
        description={t('common.comingSoon')}
      />
    );
  }

  return (
    <Animated.ScrollView style={styles.container} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
      <View style={[styles.timeline, bottomSpacer ? { paddingBottom: theme.spacing['2xl'] + bottomSpacer } : null]}>
        {timelineItems.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={index === timelineItems.length - 1}
            index={index}
            onPress={onItemPress}
          />
        ))}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeline: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
  },
});
