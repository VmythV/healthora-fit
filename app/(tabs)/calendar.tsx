// app/(tabs)/calendar.tsx
// 日志页面 - 基于 react-native-calendars 的 ExpandableCalendar + AgendaList
// - 月历可上下拖拽展开/折叠（默认月视图）
// - 横滑切月、点击切日
// - 下方时间线（AgendaList = SectionList）独立滚动
// - 当前选中日期记录显示为单 section

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CalendarProvider,
  ExpandableCalendar,
  AgendaList,
  LocaleConfig,
} from 'react-native-calendars';
import { Positions } from 'react-native-calendars/src/expandableCalendar';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { useWeekStartDay } from '@/hooks/useWeekStartDay';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { TimelineItem, TimelineItemData } from '@/components/calendar/TimelineItem';
import { DaySummary } from '@/components/calendar/DaySummary';
import { Modal } from '@/components/ui';
import { DietRecordDetail } from '@/components/diet/DietRecordDetail';
import { ExerciseRecordDetail } from '@/components/exercise/ExerciseRecordDetail';
import { Icon } from '@/components/icons';
import { TouchableOpacity } from 'react-native';
import type { DietRecord } from '@/types/diet';
import type { ExerciseRecord } from '@/types/exercise';
import type { IconName } from '@/components/icons/Icon';

// ---------- i18n / 本地化 ----------
// react-native-calendars 默认是英文，注册中文 locale
LocaleConfig.locales['zh-CN'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
};
LocaleConfig.locales['en'] = LocaleConfig.locales[''];

// ---------- 类型映射 ----------
const RECORD_ICONS: Record<string, IconName> = {
  diet: 'bowl',
  exercise: 'running',
};

// ---------- ExpandableCalendar 主题 ----------
const buildCalendarTheme = () => ({
  backgroundColor: theme.colors.background.primary,
  calendarBackground: theme.colors.background.primary,
  // 日期色
  selectedDayBackgroundColor: theme.colors.primary.main,
  selectedDayTextColor: '#FFFFFF',
  todayTextColor: theme.colors.primary.main,
  todayBackgroundColor: 'transparent',
  dayTextColor: theme.colors.text.primary,
  textDisabledColor: '#D1D5DB',
  // 记录标记点
  dotColor: theme.colors.primary.main,
  selectedDotColor: '#FFFFFF',
  // 月份导航箭头
  arrowColor: theme.colors.text.secondary,
  disabledArrowColor: theme.colors.text.tertiary,
  monthTextColor: theme.colors.text.primary,
  textMonthFontSize: theme.fontSize.bodyLg,
  textMonthFontWeight: theme.fontWeight.semibold,
  // 星期标题
  textSectionTitleColor: theme.colors.text.tertiary,
  textDayHeaderFontSize: theme.fontSize.caption,
  textDayHeaderFontWeight: theme.fontWeight.medium,
  // 日期数字
  textDayFontSize: theme.fontSize.body,
  textDayFontWeight: theme.fontWeight.regular,
});

export default function CalendarScreen() {
  const { t, locale } = useI18n();
  const { weekStartDay } = useWeekStartDay();
  const router = useRouter();

  // 配置默认 locale，跟随用户语言
  useEffect(() => {
    LocaleConfig.defaultLocale = locale === 'zh-CN' ? 'zh-CN' : 'en';
  }, [locale]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  // 当月有记录的日期集合
  const [monthMarked, setMonthMarked] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<TimelineItemData | null>(null);

  const { records: dietRecords } = useDietRecords(selectedDate);
  const { records: exerciseRecords } = useExerciseRecords(selectedDate);

  // ---------- 加载某月的标记日期 ----------
  const loadMarkedDates = useCallback(async (year: number, month0: number) => {
    try {
      const monthStart = `${year}-${String(month0 + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month0 + 1, 0).getDate();
      const monthEnd = `${year}-${String(month0 + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const [dietDates, exerciseDates] = await Promise.all([
        dietQueries.getDatesWithRecords(monthStart, monthEnd),
        exerciseQueries.getDatesWithRecords(monthStart, monthEnd),
      ]);
      setMonthMarked((prev) => {
        const next = new Set(prev);
        // 移除当月旧数据，避免反复切月后膨胀
        for (const d of prev) {
          if (d.startsWith(`${year}-${String(month0 + 1).padStart(2, '0')}-`)) {
            next.delete(d);
          }
        }
        dietDates.forEach((d) => next.add(d));
        exerciseDates.forEach((d) => next.add(d));
        return next;
      });
    } catch (err) {
      logger.error('[Calendar] 加载标记日期失败:', err);
    }
  }, []);

  // 初始加载当月
  useEffect(() => {
    loadMarkedDates(today.getFullYear(), today.getMonth());
  }, []);

  // ExpandableCalendar 切月回调
  const handleMonthChange = useCallback(
    (m: { year: number; month: number }) => {
      // m.month 是 1-12
      loadMarkedDates(m.year, m.month - 1);
    },
    [loadMarkedDates]
  );

  // ---------- markedDates（react-native-calendars 格式） ----------
  const markedDates = useMemo(() => {
    const map: Record<string, any> = {};
    monthMarked.forEach((d) => {
      map[d] = { marked: true, dotColor: theme.colors.primary.main };
    });
    map[selectedDate] = {
      ...(map[selectedDate] || {}),
      selected: true,
      selectedColor: theme.colors.primary.main,
      selectedTextColor: '#FFFFFF',
    };
    return map;
  }, [monthMarked, selectedDate]);

  // ---------- TimelineItem 数据构造 ----------
  const buildDietFields = useCallback(
    (record: DietRecord): { subtitle?: string; meta?: string } => {
      let subtitle: string | undefined;
      if (record.foodsJson) {
        try {
          const foods = JSON.parse(record.foodsJson);
          if (Array.isArray(foods) && foods.length > 0) {
            subtitle = foods
              .slice(0, 3)
              .map((f: any) => f.name)
              .filter(Boolean)
              .join('、');
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

  // ---------- AgendaList sections ----------
  // 只显示当前选中日期的一组数据；section.title 必须是 YYYY-MM-DD 格式（AgendaList 要求）
  // 空数据时返回 [] 触发 ListEmptyComponent
  const sections = useMemo(() => {
    if (timelineItems.length === 0) return [];
    return [{ title: selectedDate, data: timelineItems }];
  }, [selectedDate, timelineItems]);

  // ---------- 空状态 ----------
  const ListEmptyComponent = useMemo(
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

  const calendarTheme = useMemo(buildCalendarTheme, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* react-native-calendars 三件套 */}
      <CalendarProvider
        date={selectedDate}
        onDateChanged={(d: string) => setSelectedDate(d)}
        onMonthChange={handleMonthChange}
        showTodayButton={false}
        style={styles.providerContainer}
      >
        <ExpandableCalendar
          initialPosition={Positions.OPEN}
          firstDay={weekStartDay}
          markedDates={markedDates}
          maxDate={todayStr}
          closeOnDayPress={false}
          allowShadow={false}
          hideKnob={false}
          theme={calendarTheme}
          calendarStyle={styles.calendarStyle}
          style={styles.calendar}
        />

        <AgendaList
          sections={sections as any}
          renderItem={({ item, index, section }: any) => (
            <TimelineItem
              item={item}
              index={index}
              isLast={index === section.data.length - 1}
              onPress={setSelectedItem}
            />
          )}
          // 隐藏 section header（我们用 DaySummary 替代）
          renderSectionHeader={() => null as any}
          sectionStyle={styles.sectionStyle}
          ListHeaderComponent={<DaySummary date={selectedDate} />}
          ListEmptyComponent={ListEmptyComponent}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.agendaContent}
          showsVerticalScrollIndicator={false}
        />
      </CalendarProvider>

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
  providerContainer: {
    flex: 1,
  },
  calendar: {
    backgroundColor: theme.colors.background.primary,
  },
  calendarStyle: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  sectionStyle: {
    // 隐藏 section header 占位
    height: 0,
    margin: 0,
    padding: 0,
  },
  agendaContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
  },
  // 空状态
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.xl,
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
