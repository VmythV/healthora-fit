// hooks/useWeightRecords.ts
// 体重记录 Hook

import { useState, useCallback, useEffect, useRef } from 'react'
import { weightQueries } from '@/database/queries'
import { WeightRecord } from '@/types/weight'
import { useLoadingState } from './useLoadingState'

interface UseWeightRecordsReturn {
  records: WeightRecord[]
  latestWeight: WeightRecord | null
  isLoading: boolean
  error: string | null

  // 查询操作
  loadLatest: () => Promise<void>
  loadRecent: (limit?: number) => Promise<void>
  loadByDate: (date: string) => Promise<void>
  loadByDateRange: (startDate: string, endDate: string) => Promise<void>

  // CRUD 操作
  addRecord: (record: {
    timestamp: string
    weight: number
    bodyFatPercentage?: number
    muscleMass?: number
    source?: string
    note?: string
  }) => Promise<number>
  deleteRecord: (id: number) => Promise<void>

  // 统计
  getStats: (
    startDate: string,
    endDate: string
  ) => Promise<{
    min: number
    max: number
    avg: number
    first: number
    last: number
    change: number
  } | null>
  getDailyWeights: (
    startDate: string,
    endDate: string
  ) => Promise<{ date: string; weight: number }[]>
}

/**
 * 体重记录 Hook
 *
 * P3-50：
 * - isLoading/error 改用 useLoadingState 原语
 * - 删除 `createRecord: addRecord` 重复别名（与 addRecord 同函数）
 * - yesterdayWeight 内部 state 保留（首页需要做"今日对比昨日"）
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
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [latestWeight, setLatestWeight] = useState<WeightRecord | null>(null)
  const [yesterdayWeight, setYesterdayWeight] = useState<WeightRecord | null>(null)
  const { isLoading, error, setError, withLoading } = useLoadingState('体重记录')

  const loadYesterday = useCallback(async () => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      const result = await weightQueries.getByDate(dateStr)
      setYesterdayWeight(result)
    } catch (err) {
      setYesterdayWeight(null)
    }
  }, [])

  const loadLatest = useCallback(async () => {
    await withLoading(async () => {
      const result = await weightQueries.getLatest()
      setLatestWeight(result)
    })
  }, [withLoading])

  // P0.2 ref 模式：先把最新 loadLatest / loadYesterday 写到 ref，effect 通过 ref 调用
  const loadLatestRef = useRef(loadLatest)
  loadLatestRef.current = loadLatest
  const loadYesterdayRef = useRef(loadYesterday)
  loadYesterdayRef.current = loadYesterday
  useEffect(() => {
    loadLatestRef.current()
    loadYesterdayRef.current()
  }, [])

  const loadRecent = useCallback(
    async (limit?: number) => {
      await withLoading(async () => {
        const result = await weightQueries.getRecent(limit)
        setRecords(result)
      })
    },
    [withLoading]
  )

  const loadByDate = useCallback(
    async (date: string) => {
      await withLoading(async () => {
        const result = await weightQueries.getByDate(date)
        // P0.2 修复：原来 setLatestWeight(result) 把单条记录写到了 latestWeight 状态，
        // 导致 records 永远是空数组。getByDate 返回单条记录，应转为数组后写入 records。
        setRecords(result ? [result] : [])
      })
    },
    [withLoading]
  )

  const loadByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      await withLoading(async () => {
        const result = await weightQueries.getByDateRange(startDate, endDate)
        setRecords(result)
      })
    },
    [withLoading]
  )

  const addRecord = useCallback(
    async (record: {
      timestamp: string
      weight: number
      bodyFatPercentage?: number
      muscleMass?: number
      source?: string
      note?: string
    }) => {
      try {
        const id = await weightQueries.insert(record)

        // 刷新最新记录
        await loadLatest()

        return id
      } catch (err) {
        const message = err instanceof Error ? err.message : '添加记录失败'
        setError(message)
        throw err
      }
    },
    [loadLatest, setError]
  )

  const deleteRecord = useCallback(
    async (id: number) => {
      try {
        await weightQueries.delete(id)

        // 刷新最新记录
        await loadLatest()
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除记录失败'
        setError(message)
        throw err
      }
    },
    [loadLatest, setError]
  )

  const getStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await weightQueries.getStats(startDate, endDate)
    } catch (err) {
      return null
    }
  }, [])

  const getDailyWeights = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await weightQueries.getDailyWeights(startDate, endDate)
    } catch (err) {
      return []
    }
  }, [])

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

    addRecord,
    deleteRecord,

    getStats,
    getDailyWeights,
  }
}
