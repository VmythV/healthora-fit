// components/calendar/Timeline.tsx
// 时间轴组件

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { DietRecord } from '@/types/diet';
import { ExerciseRecord } from '@/types/exercise';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';
import { TimelineItem, TimelineItemData } from './TimelineItem';

interface TimelineProps {
  dietRecords: DietRecord[];
  exerciseRecords: ExerciseRecord[];
  onItemPress: (item: TimelineItemData) => void;
  onScroll?: any;
  /** 额外底部留白，保证折叠位移期间最后一条仍可滚入可视区 */
  bottomSpacer?: number;
  /** Snap 处理：滚动结束的事件（用于 #1 防半折叠） */
  onScrollEndDrag?: any;
  onMomentumScrollEnd?: any;
  /** 外部 ref，用于 scrollTo */
  scrollRef?: any;
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
export function Timeline({
  dietRecords,
  exerciseRecords,
  onItemPress,
  onScroll,
  bottomSpacer = 0,
  onScrollEndDrag,
  onMomentumScrollEnd,
  scrollRef,
}: TimelineProps) {
  const { t } = useI18n();
  const router = useRouter();

  // 格式化时间标签
  const formatTimeLabel = (timestamp: string): string => {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // 构建饮食记录字段
  const buildDietFields = (record: DietRecord): { subtitle?: string; meta?: string } => {
    let subtitle: string | undefined;
    // 尝试解析食物列表 → subtitle
    if (record.foodsJson) {
      try {
        const foods = JSON.parse(record.foodsJson);
        if (Array.isArray(foods) && foods.length > 0) {
          subtitle = foods.slice(0, 3).map((f: any) => f.name).filter(Boolean).join('、');
        }
      } catch {}
    }
    // 营养数据 → meta
    const metaParts: string[] = [];
    if (record.totalCalories) {
      metaParts.push(`${record.totalCalories} ${t('home.kcal')}`);
    }
    if (record.totalProtein) {
      metaParts.push(`${t('diet.protein')} ${record.totalProtein}g`);
    }
    return { subtitle, meta: metaParts.join(' · ') || undefined };
  };

  // 构建运动记录字段
  const buildExerciseFields = (record: ExerciseRecord): { subtitle?: string; meta?: string } => {
    // 时长 + 距离 → subtitle（核心数据）
    const subParts: string[] = [];
    if (record.durationMinutes) {
      subParts.push(`${record.durationMinutes} ${t('home.minutes')}`);
    }
    if (record.distanceKm) {
      subParts.push(`${record.distanceKm} ${t('exercise.km')}`);
    }
    // 消耗 → meta
    let meta: string | undefined;
    if (record.caloriesBurned) {
      meta = `${t('exercise.caloriesBurned')} ${record.caloriesBurned} ${t('home.kcal')}`;
    }
    return { subtitle: subParts.join(' · ') || undefined, meta };
  };

  // 合并并排序所有记录
  const timelineItems: TimelineItemData[] = useMemo(() => {
    const items: TimelineItemData[] = [];

    // 添加饮食记录
    dietRecords.forEach((record) => {
      const mealName = record.mealType
        ? t(`mealType.${record.mealType}`)
        : t('record.diet.title');
      const { subtitle, meta } = buildDietFields(record);
      items.push({
        id: `diet-${record.id}`,
        type: 'diet',
        time: record.timestamp,
        timeLabel: formatTimeLabel(record.timestamp),
        title: mealName,
        subtitle,
        meta,
        note: record.note || undefined,
        iconName: RECORD_ICONS.diet,
        record,
      });
    });

    // 添加运动记录
    exerciseRecords.forEach((record) => {
      const typeName = t(`exerciseType.${record.exerciseType}`);
      const { subtitle, meta } = buildExerciseFields(record);
      items.push({
        id: `exercise-${record.id}`,
        type: 'exercise',
        time: record.timestamp,
        timeLabel: formatTimeLabel(record.timestamp),
        title: typeName,
        subtitle,
        meta,
        note: record.note || undefined,
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
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Icon name="note" size={32} color={theme.colors.text.tertiary} />
        </View>
        <Text style={styles.emptyTitle}>{t('timeline.empty.title')}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/record' as any)}
          activeOpacity={0.7}
          style={styles.emptyCta}
        >
          <Text style={styles.emptyCtaText}>{t('timeline.empty.cta')}</Text>
          <Icon name="chevron-right" size={14} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      scrollEventThrottle={16}
    >
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing['4xl'],
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.base,
  },
  emptyTitle: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
  },
  emptyCtaText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.main,
  },
});
