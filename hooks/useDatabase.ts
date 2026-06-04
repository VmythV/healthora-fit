// hooks/useDatabase.ts
// 数据库初始化 Hook

import { logger } from '@/utils/logger';
import { useState, useEffect, useCallback } from 'react';
import { database } from '@/database';

interface UseDatabaseReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * 数据库初始化 Hook
 *
 * @example
 * ```tsx
 * const { isReady, isLoading, error } = useDatabase();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error} />;
 * if (!isReady) return null;
 *
 * return <App />;
 * ```
 */
export function useDatabase(): UseDatabaseReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await database.initialize();

      setIsReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '数据库初始化失败';
      setError(message);
      logger.error('[useDatabase] 初始化失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await database.close();
      await database.initialize();

      setIsReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '数据库重置失败';
      setError(message);
      logger.error('[useDatabase] 重置失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isReady,
    isLoading,
    error,
    initialize,
    reset,
  };
}
