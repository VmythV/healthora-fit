// hooks/useDietRecords.ts
// 饮食记录 Hook

import { useState, useCallback, useEffect } from 'react';
import { dietQueries } from '@/database/queries';
import { DietRecord } from '@/types/diet';

interface UseDietRecordsReturn {
  records: DietRecord[];
  todayRecords: DietRecord[];
  todayNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isLoading: boolean;
  error: string | null;

  // 查询操作
  loadToday: () => Promise<void>;
  loadByDate: (date: string) => Promise<void>;
  loadByDateRange: (startDate: string, endDate: string) => Promise<void>;
  loadRecent: (limit?: number) => Promise<void>;

  // CRUD 操作
  addRecord: (record: {
    timestamp: string;
    photoUri?: string;
    foodsJson?: string;
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFat?: number;
    mealType?: string;
    note?: string;
    isEdited?: boolean;
  }) => Promise<number>;
  updateRecord: (id: number, updates: Partial<DietRecord>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;

  // 统计
  getDailyCaloriesStats: (startDate: string, endDate: string) => Promise<{ date: string; calories: number }[]>;
  getMealTypeStats: (startDate: string, endDate: string) => Promise<{ meal_type: string; count: number; avg_calories: number }[]>;
}

/**
 * 饮食记录 Hook
 *
 * @example
 * ```tsx
 * const {
 *   todayRecords,
 *   todayNutrition,
 *   loadToday,
 *   addRecord,
 * } = useDietRecords();
 *
 * useEffect(() => {
 *   loadToday();
 * }, []);
 *
 * return (
 *   <View>
 *     <Text>今日卡路里: {todayNutrition.calories}</Text>
 *     {todayRecords.map(record => <DietCard key={record.id} record={record} />)}
 *   </View>
 * );
 * ```
 */
export function useDietRecords(date?: string): UseDietRecordsReturn {
  const [records, setRecords] = useState<DietRecord[]>([]);
  const [todayRecords, setTodayRecords] = useState<DietRecord[]>([]);
  const [todayNutrition, setTodayNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 自动加载今日数据
  useEffect(() => {
    loadToday();
  }, []);

  // 按日期加载
  useEffect(() => {
    if (date) {
      loadByDate(date);
    }
  }, [date]);

  // 计算属性
  const todayCalories = todayNutrition.calories;

  const loadToday = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [records, nutrition] = await Promise.all([
        dietQueries.getToday(),
        dietQueries.getTodayNutrition(),
      ]);

      setTodayRecords(records);
      setTodayNutrition(nutrition);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载今日记录失败';
      setError(message);
      console.error('[useDietRecords] loadToday 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDate = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await dietQueries.getByDate(date);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      console.error('[useDietRecords] loadByDate 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await dietQueries.getByDateRange(startDate, endDate);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      console.error('[useDietRecords] loadByDateRange 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRecent = useCallback(async (limit?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await dietQueries.getRecent(limit);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      console.error('[useDietRecords] loadRecent 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecord = useCallback(async (record: {
    timestamp: string;
    photoUri?: string;
    foodsJson?: string;
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFat?: number;
    mealType?: string;
    note?: string;
    isEdited?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const id = await dietQueries.insert(record);

      // 刷新今日记录
      await loadToday();

      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : '添加记录失败';
      setError(message);
      console.error('[useDietRecords] addRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadToday]);

  const updateRecord = useCallback(async (id: number, updates: Partial<DietRecord>) => {
    try {
      setIsLoading(true);
      setError(null);

      await dietQueries.update(id, updates);

      // 刷新今日记录
      await loadToday();
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新记录失败';
      setError(message);
      console.error('[useDietRecords] updateRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadToday]);

  const deleteRecord = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await dietQueries.delete(id);

      // 刷新今日记录
      await loadToday();
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除记录失败';
      setError(message);
      console.error('[useDietRecords] deleteRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadToday]);

  const getDailyCaloriesStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await dietQueries.getDailyCaloriesStats(startDate, endDate);
    } catch (err) {
      console.error('[useDietRecords] getDailyCaloriesStats 失败:', err);
      return [];
    }
  }, []);

  const getMealTypeStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await dietQueries.getMealTypeStats(startDate, endDate);
    } catch (err) {
      console.error('[useDietRecords] getMealTypeStats 失败:', err);
      return [];
    }
  }, []);

  return {
    records,
    todayRecords,
    todayNutrition,
    todayCalories,
    isLoading,
    error,

    loadToday,
    loadByDate,
    loadByDateRange,
    loadRecent,

    addRecord,
    updateRecord,
    deleteRecord,

    getDailyCaloriesStats,
    getMealTypeStats,
  };
}
