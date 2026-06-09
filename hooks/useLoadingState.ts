// hooks/useLoadingState.ts
// 通用加载态 + 错误态原语
//
// P3-50：抽离三个 record Hook 重复的 `setIsLoading(true) + try/catch/finally` 模板。
// 提供 { isLoading, error, setError, withLoading(fn) } —— 替换 ~30 处模板。
//
// 嵌套 withLoading（如 addRecord 内部 await loadToday()）：
//   - 内层 finally 立即把 isLoading 设回 false
//   - 外层 setIsLoading(true) 还在 Promise 链上，状态再次变为 true
//   - 外层 finally 最后再设回 false
//   - React 19 自动 batching 合并为一次提交，ActivityIndicator 不闪烁
//
// 业务前缀（errorPrefix）：catch 时把 err.message 前缀标注，让用户
// 看到 "[饮食记录] xxx" 类的提示，便于定位错误来源。

import { useCallback, useState } from 'react'
import { logger } from '@/utils/logger'

export interface UseLoadingStateReturn {
  isLoading: boolean
  error: string | null
  setError: (error: string | null) => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

/**
 * 加载态 + 错误态原语
 *
 * @param errorPrefix 错误前缀（如 '饮食记录'）—— catch 时拼到 err.message 之前
 *
 * @example
 * ```tsx
 * const { isLoading, error, withLoading } = useLoadingState('饮食记录');
 *
 * const loadToday = useCallback(async () => {
 *   await withLoading(async () => {
 *     const records = await dietQueries.getToday();
 *     setTodayRecords(records);
 *   });
 * }, [withLoading]);
 * ```
 */
export function useLoadingState(errorPrefix?: string): UseLoadingStateReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      setError(null)
      try {
        return await fn()
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err)
        const message = errorPrefix ? `${errorPrefix}: ${raw}` : raw
        setError(message)
        logger.error(`[useLoadingState] ${errorPrefix ?? 'error'}:`, err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [errorPrefix]
  )

  return { isLoading, error, setError, withLoading }
}
