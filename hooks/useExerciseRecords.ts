// hooks/useExerciseRecords.ts
// 运动记录 Hook

import { logger } from '@/utils/logger';
import { useState, useCallback, useEffect, useRef } from 'react';
import { exerciseQueries } from '@/database/queries';
import { ExerciseRecord } from '@/types/exercise';

interface UseExerciseRecordsReturn {
  records: ExerciseRecord[];
  todayRecords: ExerciseRecord[];
  todayDuration: number;
  todayCalories: number;
  isLoading: boolean;
  error: string | null;

  // 查询操作
  loadToday: () => Promise<void>;
  loadByDate: (date: string) => Promise<void>;
  loadByDateRange: (startDate: string, endDate: string) => Promise<void>;

  // CRUD 操作
  addRecord: (record: {
    timestamp: string;
    exerciseType: string;
    durationMinutes: number;
    caloriesBurned?: number;
    distanceKm?: number;
    heartRateAvg?: number;
    source?: string;
    screenshotUri?: string;
    rawData?: string;
    note?: string;
  }) => Promise<number>;
  updateRecord: (id: number, updates: Partial<ExerciseRecord>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;

  // 统计
  getDailyStats: (startDate: string, endDate: string) => Promise<{ date: string; duration: number; calories: number }[]>;
  getTypeStats: (startDate: string, endDate: string) => Promise<{ exercise_type: string; count: number; total_duration: number }[]>;
}

/**
 * 运动记录 Hook
 *
 * P3-48：date 形参的格式约束 —— 必须是 `'YYYY-MM-DD'` 格式字符串（如 '2026-06-08'）。
 * 父组件应保证引用稳定（来自 `useState` 派生或 `useMemo` 缓存），
 * 否则内部 `useEffect([date], ...)` 会每次 render 重复执行。
 *
 * @param date 可选，'YYYY-MM-DD' 格式字符串（如 '2026-06-08'）。
 *             undefined 或 null 表示"今日"（由 hook 内部 `loadToday` 计算）。
 *
 * @example
 * ```tsx
 * const {
 *   todayRecords,
 *   todayDuration,
 *   todayCalories,
 *   loadToday,
 *   addRecord,
 * } = useExerciseRecords();
 *
 * useEffect(() => {
 *   loadToday();
 * }, []);
 *
 * return (
 *   <View>
 *     <Text>今日运动: {todayDuration} 分钟</Text>
 *     <Text>消耗卡路里: {todayCalories}</Text>
 *     {todayRecords.map(record => <ExerciseCard key={record.id} record={record} />)}
 *   </View>
 * );
 * ```
 */
export function useExerciseRecords(date?: string): UseExerciseRecordsReturn {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [todayRecords, setTodayRecords] = useState<ExerciseRecord[]>([]);
  const [todayDuration, setTodayDuration] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // P2-24：去掉 todayMinutes/todayCaloriesBurned 别名（仅 todayDuration/todayCalories 为规范名）

  const loadToday = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [records, duration, calories] = await Promise.all([
        exerciseQueries.getToday(),
        exerciseQueries.getTodayDuration(),
        exerciseQueries.getTodayCalories(),
      ]);

      setTodayRecords(records);
      setTodayDuration(duration);
      setTodayCalories(calories);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载今日记录失败';
      setError(message);
      logger.error('[useExerciseRecords] loadToday 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDate = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await exerciseQueries.getByDate(date);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      logger.error('[useExerciseRecords] loadByDate 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await exerciseQueries.getByDateRange(startDate, endDate);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      logger.error('[useExerciseRecords] loadByDateRange 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // P0.2 ref 模式：useEffect 拿最新 loadToday / loadByDate 引用
  const loadTodayRef = useRef(loadToday);
  loadTodayRef.current = loadToday;
  const loadByDateRef = useRef(loadByDate);
  loadByDateRef.current = loadByDate;

  useEffect(() => {
    loadTodayRef.current();
  }, []);

  useEffect(() => {
    if (date) {
      loadByDateRef.current(date);
    }
  }, [date]);

  const addRecord = useCallback(async (record: {
    timestamp: string;
    exerciseType: string;
    durationMinutes: number;
    caloriesBurned?: number;
    distanceKm?: number;
    heartRateAvg?: number;
    source?: string;
    screenshotUri?: string;
    rawData?: string;
    note?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const id = await exerciseQueries.insert(record);

      // 刷新今日记录
      await loadToday();

      // P1-9 修复：同步刷 records
      const targetDate = date ?? new Date().toISOString().slice(0, 10);
      const newDateStr = record.timestamp.slice(0, 10);
      if (!date || newDateStr === targetDate) {
        const fresh = await exerciseQueries.getByDate(targetDate);
        setRecords(fresh);
      }

      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : '添加记录失败';
      setError(message);
      logger.error('[useExerciseRecords] addRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [date, loadToday]);

  const updateRecord = useCallback(async (id: number, updates: Partial<ExerciseRecord>) => {
    try {
      setIsLoading(true);
      setError(null);

      await exerciseQueries.update(id, updates);

      // 刷新今日记录
      await loadToday();

      // P1-9 修复：同步刷 records（date 不传时）
      if (!date) {
        const targetDate = new Date().toISOString().slice(0, 10);
        const fresh = await exerciseQueries.getByDate(targetDate);
        setRecords(fresh);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新记录失败';
      setError(message);
      logger.error('[useExerciseRecords] updateRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [date, loadToday]);

  const deleteRecord = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await exerciseQueries.delete(id);

      // 刷新今日记录
      await loadToday();

      // P1-9 修复：同步刷 records（date 不传时）
      if (!date) {
        const targetDate = new Date().toISOString().slice(0, 10);
        const fresh = await exerciseQueries.getByDate(targetDate);
        setRecords(fresh);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除记录失败';
      setError(message);
      logger.error('[useExerciseRecords] deleteRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadToday]);

  const getDailyStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await exerciseQueries.getDailyStats(startDate, endDate);
    } catch (err) {
      logger.error('[useExerciseRecords] getDailyStats 失败:', err);
      return [];
    }
  }, []);

  const getTypeStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await exerciseQueries.getTypeStats(startDate, endDate);
    } catch (err) {
      logger.error('[useExerciseRecords] getTypeStats 失败:', err);
      return [];
    }
  }, []);

  return {
    records,
    todayRecords,
    todayDuration,
    todayCalories,
    isLoading,
    error,

    loadToday,
    loadByDate,
    loadByDateRange,

    addRecord,
    updateRecord,
    deleteRecord,

    getDailyStats,
    getTypeStats,
  };
}
