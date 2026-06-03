// hooks/useWeightRecords.ts
// 体重记录 Hook

import { useState, useCallback } from 'react';
import { weightQueries } from '@/database/queries';
import { WeightRecord, WeightStats } from '@/types/weight';

interface UseWeightRecordsReturn {
  records: WeightRecord[];
  latestWeight: WeightRecord | null;
  isLoading: boolean;
  error: string | null;

  // 查询操作
  loadLatest: () => Promise<void>;
  loadRecent: (limit?: number) => Promise<void>;
  loadByDate: (date: string) => Promise<void>;
  loadByDateRange: (startDate: string, endDate: string) => Promise<void>;

  // CRUD 操作
  addRecord: (record: {
    timestamp: string;
    weight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    source?: string;
    note?: string;
  }) => Promise<number>;
  deleteRecord: (id: number) => Promise<void>;

  // 统计
  getStats: (startDate: string, endDate: string) => Promise<WeightStats | null>;
  getDailyWeights: (startDate: string, endDate: string) => Promise<{ date: string; weight: number }[]>;
}

/**
 * 体重记录 Hook
 *
 * @example
 * ```tsx
 * const {
 *   latestWeight,
 *   loadLatest,
 *   addRecord,
 * } = useWeightRecords();
 *
 * useEffect(() => {
 *   loadLatest();
 * }, []);
 *
 * return (
 *   <View>
 *     <Text>当前体重: {latestWeight?.weight} kg</Text>
 *     <Button onPress={() => addRecord({ timestamp: new Date().toISOString(), weight: 70.5 })}>
 *       记录体重
 *     </Button>
 *   </View>
 * );
 * ```
 */
export function useWeightRecords(): UseWeightRecordsReturn {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await weightQueries.getLatest();
      setLatestWeight(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载最新体重失败';
      setError(message);
      console.error('[useWeightRecords] loadLatest 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRecent = useCallback(async (limit?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await weightQueries.getRecent(limit);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      console.error('[useWeightRecords] loadRecent 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDate = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await weightQueries.getByDate(date);
      setLatestWeight(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      console.error('[useWeightRecords] loadByDate 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await weightQueries.getByDateRange(startDate, endDate);
      setRecords(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      console.error('[useWeightRecords] loadByDateRange 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecord = useCallback(async (record: {
    timestamp: string;
    weight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    source?: string;
    note?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const id = await weightQueries.insert(record);

      // 刷新最新记录
      await loadLatest();

      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : '添加记录失败';
      setError(message);
      console.error('[useWeightRecords] addRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadLatest]);

  const deleteRecord = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await weightQueries.delete(id);

      // 刷新最新记录
      await loadLatest();
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除记录失败';
      setError(message);
      console.error('[useWeightRecords] deleteRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadLatest]);

  const getStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await weightQueries.getStats(startDate, endDate);
    } catch (err) {
      console.error('[useWeightRecords] getStats 失败:', err);
      return null;
    }
  }, []);

  const getDailyWeights = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await weightQueries.getDailyWeights(startDate, endDate);
    } catch (err) {
      console.error('[useWeightRecords] getDailyWeights 失败:', err);
      return [];
    }
  }, []);

  return {
    records,
    latestWeight,
    isLoading,
    error,

    loadLatest,
    loadRecent,
    loadByDate,
    loadByDateRange,

    addRecord,
    deleteRecord,

    getStats,
    getDailyWeights,
  };
}
