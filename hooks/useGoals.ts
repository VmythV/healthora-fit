// hooks/useGoals.ts
// 目标设置 Hook

import { useState, useCallback } from 'react';
import { goalQueries } from '@/database/queries';
import { Goal } from '@/types/goal';

interface UseGoalsReturn {
  goals: Goal[];
  activeGoal: Goal | null;
  isLoading: boolean;
  error: string | null;

  // 查询操作
  loadAll: () => Promise<void>;
  loadActive: (type?: string) => Promise<void>;

  // CRUD 操作
  setGoal: (goal: {
    goalType: string;
    targetValue: number;
    startValue?: number;
    startDate?: string;
    targetDate?: string;
  }) => Promise<number>;
  updateGoal: (id: number, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  deactivateGoal: (id: number) => Promise<void>;
}

/**
 * 目标设置 Hook
 *
 * @example
 * ```tsx
 * const {
 *   activeGoal,
 *   loadActive,
 *   setGoal,
 * } = useGoals();
 *
 * useEffect(() => {
 *   loadActive('target_weight');
 * }, []);
 *
 * return (
 *   <View>
 *     <Text>目标体重: {activeGoal?.targetValue} kg</Text>
 *     <Button onPress={() => setGoal({
 *       goalType: 'target_weight',
 *       targetValue: 70,
 *       startValue: 75,
 *     })}>
 *       设置目标
 *     </Button>
 *   </View>
 * );
 * ```
 */
export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await goalQueries.getAll();
      setGoals(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载目标失败';
      setError(message);
      console.error('[useGoals] loadAll 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadActive = useCallback(async (type?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await goalQueries.getActive(type);
      setActiveGoal(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载目标失败';
      setError(message);
      console.error('[useGoals] loadActive 失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoal = useCallback(async (goal: {
    goalType: string;
    targetValue: number;
    startValue?: number;
    startDate?: string;
    targetDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const id = await goalQueries.set(goal);

      // 刷新活跃目标
      await loadActive(goal.goalType);

      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : '设置目标失败';
      setError(message);
      console.error('[useGoals] setGoal 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadActive]);

  const updateGoal = useCallback(async (id: number, updates: Partial<Goal>) => {
    try {
      setIsLoading(true);
      setError(null);

      await goalQueries.update(id, updates);

      // 刷新目标列表
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新目标失败';
      setError(message);
      console.error('[useGoals] updateGoal 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadAll]);

  const deleteGoal = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await goalQueries.delete(id);

      // 刷新目标列表
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除目标失败';
      setError(message);
      console.error('[useGoals] deleteGoal 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadAll]);

  const deactivateGoal = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await goalQueries.deactivate(id);

      // 刷新目标列表
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : '停用目标失败';
      setError(message);
      console.error('[useGoals] deactivateGoal 失败:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadAll]);

  return {
    goals,
    activeGoal,
    isLoading,
    error,

    loadAll,
    loadActive,

    setGoal,
    updateGoal,
    deleteGoal,
    deactivateGoal,
  };
}
