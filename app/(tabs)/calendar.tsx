// app/(tabs)/calendar.tsx
// 日志页面 - 月历折叠为周视图

import { logger } from '@/utils/logger';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { CalendarGrid, DayDetail } from '@/components/calendar';

// Android 需要启用 LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLLAPSE_THRESHOLD = 60;

export default function CalendarScreen() {
  const { t } = useI18n();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [calHeight, setCalHeight] = useState(360);
  const [headerBottom, setHeaderBottom] = useState(56);

  useEffect(() => {
    loadMarkedDates();
  }, [year, month]);

  const loadMarkedDates = async () => {
    try {
      const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const [dietDates, exerciseDates] = await Promise.all([
        dietQueries.getDatesWithRecords(monthStart, monthEnd),
        exerciseQueries.getDatesWithRecords(monthStart, monthEnd),
      ]);

      setMarkedDates([...new Set([...dietDates, ...exerciseDates])]);
    } catch (err) {
      logger.error('[Calendar] 加载标记日期失败:', err);
    }
  };

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  // 滚动检测折叠
  const handleScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const shouldCollapse = y > COLLAPSE_THRESHOLD;
    if (shouldCollapse !== calendarCollapsed) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCalendarCollapsed(shouldCollapse);
    }
  }, [calendarCollapsed]);

  // 测量日历实际高度
  const handleCalLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && !calendarCollapsed) {
      setCalHeight(h + 12);
    }
  }, [calendarCollapsed]);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.header}
        onLayout={(e) => setHeaderBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
      >
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      {/* 日历 - 绝对定位 */}
      <View
        style={styles.calendarFloat}
        onLayout={handleCalLayout}
      >
        <CalendarGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          markedDates={markedDates}
          maxDate={todayStr}
          onDatePress={handleDatePress}
          onMonthChange={handleMonthChange}
          collapsed={calendarCollapsed}
        />
      </View>

      {/* 详情区 */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: calHeight }}
      >
        <DayDetail date={selectedDate} maxDate={todayStr} />
        <View style={{ height: 40 }} />
      </ScrollView>
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
    zIndex: 20,
  },
  calendarFloat: {
    position: 'absolute',
    top: headerBottom + theme.spacing.sm,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
