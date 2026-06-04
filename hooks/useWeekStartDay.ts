// hooks/useWeekStartDay.ts
// 星期开始日设置 Hook

import { logger } from '@/utils/logger';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEK_START_DAY_KEY = '@healthora:weekStartDay';

// 星期开始日选项
export const WEEK_START_OPTIONS = [
  { value: 0, label: '周日', labelEn: 'Sunday' },
  { value: 1, label: '周一', labelEn: 'Monday' },
  { value: 2, label: '周二', labelEn: 'Tuesday' },
  { value: 3, label: '周三', labelEn: 'Wednesday' },
  { value: 4, label: '周四', labelEn: 'Thursday' },
  { value: 5, label: '周五', labelEn: 'Friday' },
  { value: 6, label: '周六', labelEn: 'Saturday' },
];

/**
 * 星期开始日设置 Hook
 *
 * @example
 * ```tsx
 * const { weekStartDay, setWeekStartDay, getWeekDays } = useWeekStartDay();
 *
 * // 获取调整后的星期列表
 * const weekDays = getWeekDays(); // ['一', '二', '三', '四', '五', '六', '日']
 * ```
 */
export function useWeekStartDay() {
  const [weekStartDay, setWeekStartDayState] = useState<number>(1); // 默认周一
  const [isLoading, setIsLoading] = useState(true);

  // 加载设置
  useEffect(() => {
    loadWeekStartDay();
  }, []);

  const loadWeekStartDay = async () => {
    try {
      const value = await AsyncStorage.getItem(WEEK_START_DAY_KEY);
      if (value !== null) {
        setWeekStartDayState(parseInt(value, 10));
      }
    } catch (error) {
      logger.error('[useWeekStartDay] Failed to load week start day:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存设置
  const setWeekStartDay = useCallback(async (day: number) => {
    try {
      await AsyncStorage.setItem(WEEK_START_DAY_KEY, day.toString());
      setWeekStartDayState(day);
    } catch (error) {
      logger.error('[useWeekStartDay] Failed to save week start day:', error);
    }
  }, []);

  // 获取调整后的星期列表
  const getWeekDays = useCallback((locale: 'zh' | 'en' = 'zh') => {
    const weekDays = locale === 'zh'
      ? ['日', '一', '二', '三', '四', '五', '六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 根据 weekStartDay 调整顺序
    const startIdx = weekStartDay;
    return [
      ...weekDays.slice(startIdx),
      ...weekDays.slice(0, startIdx),
    ];
  }, [weekStartDay]);

  // 获取月份第一天是星期几（调整后的）
  const getAdjustedFirstDay = useCallback((year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0-6, 0=周日
    // 调整为相对于 weekStartDay 的偏移
    return (firstDay - weekStartDay + 7) % 7;
  }, [weekStartDay]);

  return {
    weekStartDay,
    setWeekStartDay,
    getWeekDays,
    getAdjustedFirstDay,
    isLoading,
  };
}
