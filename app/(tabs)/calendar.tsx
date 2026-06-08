// app/(tabs)/calendar.tsx
// 日志页面 - 基于自实现 CollapsibleCalendar + FlatList
// - 默认月视图；上滑列表/拖月历区都能折叠成单周
// - 列表滚到顶继续下拉 → 月历展开
// - 完全使用 Reanimated 4 + GestureHandler v2，Fabric 兼容

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { useWeekStartDay } from '@/hooks/useWeekStartDay';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CollapsibleCalendar } from '@/components/calendar/CollapsibleCalendar';
import { TimelineItem, TimelineItemData } from '@/components/calendar/TimelineItem';
import { DaySummary } from '@/components/calendar/DaySummary';
import { Modal } from '@/components/ui';
import { DietRecordDetail } from '@/components/diet/DietRecordDetail';
import { ExerciseRecordDetail } from '@/components/exercise/ExerciseRecordDetail';
import { Icon } from '@/components/icons';
import type { DietRecord } from '@/types/diet';
import type { ExerciseRecord } from '@/types/exercise';
import type { IconName } from '@/components/icons/Icon';

const AnimatedFlatList = Animated.FlatList;

const RECORD_ICONS: Record<string, IconName> = {
  diet: 'bowl',
  exercise: 'running',
};

const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CalendarScreen() {
  const { t, locale } = useI18n();
  const { weekStartDay } = useWeekStartDay();
  const router = useRouter();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [monthMarked, setMonthMarked] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<TimelineItemData | null>(null);

  const { records: dietRecords } = useDietRecords(selectedDate);
  const { records: exerciseRecords } = useExerciseRecords(selectedDate);

  // 加载某月标记日期
  // P0.5 加固：函数式更新里直接创建新 Set（不基于 prev 合并），
  // 保证跨月切换时历史月份一定被丢弃，set 只含当月 prefix 的日期。
  const loadMarkedDates = useCallback(async (year: number, month0: number) => {
    try {
      const prefix = `${year}-${String(month0 + 1).padStart(2, '0')}-`;
      const ms = `${prefix}01`;
      const last = new Date(year, month0 + 1, 0).getDate();
      const me = `${prefix}${String(last).padStart(2, '0')}`;
      const [dd, ed] = await Promise.all([
        dietQueries.getDatesWithRecords(ms, me),
        exerciseQueries.getDatesWithRecords(ms, me),
      ]);
      setMonthMarked(() => {
        const next = new Set<string>();
        // 防御性过滤：只接受当月 prefix 的日期，避免 SQL 查询返回意外数据
        dd.forEach((d) => {
          if (d.startsWith(prefix)) next.add(d);
        });
        ed.forEach((d) => {
          if (d.startsWith(prefix)) next.add(d);
        });
        return next;
      });
    } catch (err) {
      logger.error('[Calendar] 加载标记失败:', err);
    }
  }, []);

  useEffect(() => {
    loadMarkedDates(today.getFullYear(), today.getMonth());
  }, []);

  const handleMonthChange = useCallback(
    (y: number, m0: number) => {
      loadMarkedDates(y, m0);
    },
    [loadMarkedDates]
  );

  // ---------- 时间线数据 ----------
  const buildDietFields = useCallback(
    (record: DietRecord): { subtitle?: string; meta?: string } => {
      let subtitle: string | undefined;
      if (record.foodsJson) {
        try {
          const foods = JSON.parse(record.foodsJson);
          if (Array.isArray(foods) && foods.length > 0) {
            subtitle = foods.slice(0, 3).map((f: any) => f.name).filter(Boolean).join('、');
          }
        } catch {}
      }
      const metaParts: string[] = [];
      if (record.totalCalories) metaParts.push(`${record.totalCalories} ${t('home.kcal')}`);
      if (record.totalProtein) metaParts.push(`${t('diet.protein')} ${record.totalProtein}g`);
      return { subtitle, meta: metaParts.join(' · ') || undefined };
    },
    [t]
  );

  const buildExerciseFields = useCallback(
    (record: ExerciseRecord): { subtitle?: string; meta?: string } => {
      const subParts: string[] = [];
      if (record.durationMinutes) subParts.push(`${record.durationMinutes} ${t('home.minutes')}`);
      if (record.distanceKm) subParts.push(`${record.distanceKm} ${t('exercise.km')}`);
      let meta: string | undefined;
      if (record.caloriesBurned) {
        meta = `${t('exercise.caloriesBurned')} ${record.caloriesBurned} ${t('home.kcal')}`;
      }
      return { subtitle: subParts.join(' · ') || undefined, meta };
    },
    [t]
  );

  const formatTimeLabel = (timestamp: string): string => {
    const d = new Date(timestamp);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const timelineItems = useMemo<TimelineItemData[]>(() => {
    const items: TimelineItemData[] = [];
    dietRecords.forEach((record) => {
      const mealName = record.mealType ? t(`mealType.${record.mealType}`) : t('record.diet.title');
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
    items.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    return items;
  }, [dietRecords, exerciseRecords, buildDietFields, buildExerciseFields, t]);

  // FlatList renderItem
  // P1-8 修正：依赖改 [timelineItems] 而非 [timelineItems.length]
  // 原因：原依赖只在数组长度变化时重建回调，导致中段删除后 isLast 不更新
  const renderItem = useCallback(
    ({ item, index }: { item: TimelineItemData; index: number }) => (
      <TimelineItem
        item={item}
        index={index}
        isLast={index === timelineItems.length - 1}
        onPress={setSelectedItem}
      />
    ),
    [timelineItems, setSelectedItem]
  );

  const keyExtractor = useCallback((item: TimelineItemData) => item.id, []);

  const ListHeader = useMemo(() => <DaySummary date={selectedDate} />, [selectedDate]);

  const ListEmpty = useMemo(
    () => (
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
    ),
    [t, router]
  );

  const monthNames = locale === 'zh-CN' ? MONTHS_ZH : MONTHS_EN;
  const weekDayNames = locale === 'zh-CN' ? WEEKDAYS_ZH : WEEKDAYS_EN;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      <CollapsibleCalendar
        selectedDate={selectedDate}
        onDatePress={setSelectedDate}
        onMonthChange={handleMonthChange}
        markedDates={monthMarked}
        maxDate={todayStr}
        firstDay={weekStartDay}
        monthNames={monthNames}
        weekDayNames={weekDayNames}
      >
        {({ scrollHandler, scrollRef }) => (
          <AnimatedFlatList
            ref={scrollRef}
            data={timelineItems}
            renderItem={renderItem as any}
            keyExtractor={keyExtractor as any}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
          />
        )}
      </CollapsibleCalendar>

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
              onDelete={() => setSelectedItem(null)}
            />
          ) : selectedItem?.type === 'exercise' ? (
            <ExerciseRecordDetail
              record={selectedItem.record as ExerciseRecord}
              onDelete={() => setSelectedItem(null)}
            />
          ) : null}
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  listContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
    flexGrow: 1, // 让 ListEmptyComponent 撑开
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['4xl'],
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
  modalContent: {
    maxHeight: 400,
  },
});
