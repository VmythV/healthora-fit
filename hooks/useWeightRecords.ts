// hooks/useWeightRecords.ts
// 体重记录 Hook

import { logger } from '@/utils/logger';
import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [yesterdayWeight, setYesterdayWeight] = useState<WeightRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 自动加载最新数据
  // P0.2 修复：useEffect 改用 ref 模式拿最新回调引用。
  // 注意：ref 必须在 useCallback 定义之后赋值，否则捕获到 undefined。
  // 这里的 useEffect 注册在所有 useCallback 之后。

  const loadYesterday = useCallback(async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      const result = await weightQueries.getByDate(dateStr);
      setYesterdayWeight(result);
    } catch (err) {
      logger.error('[useWeightRecords] loadYesterday 失败:', err);
    }
  }, []);

  const loadLatest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await weightQueries.getLatest();
      setLatestWeight(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载最新体重失败';
      setError(message);
      logger.error('[useWeightRecords] loadLatest 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // P0.2 ref 模式：先把最新 loadLatest / loadYesterday 写到 ref，effect 通过 ref 调用
  const loadLatestRef = useRef(loadLatest);
  loadLatestRef.current = loadLatest;
  const loadYesterdayRef = useRef(loadYesterday);
  loadYesterdayRef.current = loadYesterday;
  useEffect(() => {
    loadLatestRef.current();
    loadYesterdayRef.current();
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
      logger.error('[useWeightRecords] loadRecent 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDate = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await weightQueries.getByDate(date);
      // P0.2 修复：原来 setLatestWeight(result) 把单条记录写到了 latestWeight 状态，
      // 导致 records 永远是空数组。getByDate 返回单条记录，应转为数组后写入 records。
      setRecords(result ? [result] : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载记录失败';
      setError(message);
      logger.error('[useWeightRecords] loadByDate 失败:', err);
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
      logger.error('[useWeightRecords] loadByDateRange 失败:', err);
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
      logger.error('[useWeightRecords] addRecord 失败:', err);
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
      logger.error('[useWeightRecords] deleteRecord 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadLatest]);

  const getStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await weightQueries.getStats(startDate, endDate);
    } catch (err) {
      logger.error('[useWeightRecords] getStats 失败:', err);
      return null;
    }
  }, []);

  const getDailyWeights = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await weightQueries.getDailyWeights(startDate, endDate);
    } catch (err) {
      logger.error('[useWeightRecords] getDailyWeights 失败:', err);
      return [];
    }
  }, []);

  return {
    records,
    latestWeight,
    yesterdayWeight,
    isLoading,
    error,

    loadLatest,
    loadRecent,
    loadByDate,
    loadByDateRange,

    createRecord: addRecord,
    addRecord,
    deleteRecord,

    getStats,
    getDailyWeights,
  };
}
