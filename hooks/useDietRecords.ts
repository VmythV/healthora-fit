// hooks/useDietRecords.ts
// 饮食记录 Hook

import { useState, useCallback, useEffect, useRef } from 'react'
import { dietQueries } from '@/database/queries'
import { DietRecord } from '@/types/diet'
import { useLoadingState } from './useLoadingState'

interface UseDietRecordsReturn {
  records: DietRecord[]
  todayRecords: DietRecord[]
  todayNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  isLoading: boolean
  error: string | null

  // 查询操作
  loadToday: () => Promise<void>
  loadByDate: (date: string) => Promise<void>
  loadByDateRange: (startDate: string, endDate: string) => Promise<void>
  loadRecent: (limit?: number) => Promise<void>

  // CRUD 操作
  addRecord: (record: {
    timestamp: string
    photoUri?: string
    foodsJson?: string
    totalCalories?: number
    totalProtein?: number
    totalCarbs?: number
    totalFat?: number
    mealType?: string
    note?: string
    isEdited?: boolean
  }) => Promise<number>
  updateRecord: (id: number, updates: Partial<DietRecord>) => Promise<void>
  deleteRecord: (id: number) => Promise<void>

  // 统计
  getDailyCaloriesStats: (
    startDate: string,
    endDate: string
  ) => Promise<{ date: string; calories: number }[]>
  getMealTypeStats: (
    startDate: string,
    endDate: string
  ) => Promise<{ meal_type: string; count: number; avg_calories: number }[]>
}

/**
 * 饮食记录 Hook
 *
 * P3-48：date 形参的格式约束 —— 必须是 `'YYYY-MM-DD'` 格式字符串（如 '2026-06-08'）。
 * 父组件应保证引用稳定（来自 `useState` 派生或 `useMemo` 缓存），
 * 否则内部 `useEffect([date], ...)` 会每次 render 重复执行。
 *
 * P3-50：isLoading/error 改用 useLoadingState 原语，移除本地 setIsLoading/setError 模板。
 *
 * @param date 可选，'YYYY-MM-DD' 格式字符串（如 '2026-06-08'）。
 *             undefined 或 null 表示"今日"（由 hook 内部 `loadToday` 计算）。
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
  const [records, setRecords] = useState<DietRecord[]>([])
  const [todayRecords, setTodayRecords] = useState<DietRecord[]>([])
  const [todayNutrition, setTodayNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const { isLoading, error, setError, withLoading } = useLoadingState('饮食记录')

  // 计算属性
  const todayCalories = todayNutrition.calories

  const loadToday = useCallback(async () => {
    await withLoading(async () => {
      const [records, nutrition] = await Promise.all([
        dietQueries.getToday(),
        dietQueries.getTodayNutrition(),
      ])
      setTodayRecords(records)
      setTodayNutrition(nutrition)
    })
  }, [withLoading])

  const loadByDate = useCallback(
    async (date: string) => {
      await withLoading(async () => {
        const result = await dietQueries.getByDate(date)
        setRecords(result)
      })
    },
    [withLoading]
  )

  const loadByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      await withLoading(async () => {
        const result = await dietQueries.getByDateRange(startDate, endDate)
        setRecords(result)
      })
    },
    [withLoading]
  )

  // P0.2 ref 模式：useEffect 拿最新 loadToday / loadByDate 引用
  const loadTodayRef = useRef(loadToday)
  loadTodayRef.current = loadToday
  const loadByDateRef = useRef(loadByDate)
  loadByDateRef.current = loadByDate

  useEffect(() => {
    loadTodayRef.current()
  }, [])

  useEffect(() => {
    if (date) {
      loadByDateRef.current(date)
    }
  }, [date])

  const loadRecent = useCallback(
    async (limit?: number) => {
      await withLoading(async () => {
        const result = await dietQueries.getRecent(limit)
        setRecords(result)
      })
    },
    [withLoading]
  )

  const addRecord = useCallback(
    async (record: {
      timestamp: string
      photoUri?: string
      foodsJson?: string
      totalCalories?: number
      totalProtein?: number
      totalCarbs?: number
      totalFat?: number
      mealType?: string
      note?: string
      isEdited?: boolean
    }) => {
      try {
        const id = await dietQueries.insert(record)

        // 刷新今日记录
        await loadToday()

        // P1-9 修复：同步刷 records（DietRecordList 不带 date 或 date===今天时需要）
        const targetDate = date ?? new Date().toISOString().slice(0, 10)
        const newDateStr = record.timestamp.slice(0, 10)
        if (!date || newDateStr === targetDate) {
          const fresh = await dietQueries.getByDate(targetDate)
          setRecords(fresh)
        }

        return id
      } catch (err) {
        const message = err instanceof Error ? err.message : '添加记录失败'
        setError(message)
        throw err
      }
    },
    [date, loadToday, setError]
  )

  const updateRecord = useCallback(
    async (id: number, updates: Partial<DietRecord>) => {
      try {
        await dietQueries.update(id, updates)

        // 刷新今日记录
        await loadToday()

        // P1-9 修复：同步刷 records（date 不传或 ===今天时）
        if (!date) {
          const targetDate = new Date().toISOString().slice(0, 10)
          const fresh = await dietQueries.getByDate(targetDate)
          setRecords(fresh)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新记录失败'
        setError(message)
        throw err
      }
    },
    [date, loadToday, setError]
  )

  const deleteRecord = useCallback(
    async (id: number) => {
      try {
        await dietQueries.delete(id)

        // 刷新今日记录
        await loadToday()

        // P1-9 修复：同步刷 records（date 不传或 ===今天时）
        if (!date) {
          const targetDate = new Date().toISOString().slice(0, 10)
          const fresh = await dietQueries.getByDate(targetDate)
          setRecords(fresh)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除记录失败'
        setError(message)
        throw err
      }
    },
    [date, loadToday, setError]
  )

  const getDailyCaloriesStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await dietQueries.getDailyCaloriesStats(startDate, endDate)
    } catch (err) {
      return []
    }
  }, [])

  const getMealTypeStats = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await dietQueries.getMealTypeStats(startDate, endDate)
    } catch (err) {
      return []
    }
  }, [])

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
  }
}
