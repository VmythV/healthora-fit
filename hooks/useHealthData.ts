// hooks/useHealthData.ts
// 健康数据 Hook

import { logger } from '@/utils/logger';
import { useState, useCallback } from 'react';
import {
  HealthDataService,
  HealthConnectionStatus,
  HealthPermissions,
  HealthSyncResult,
  getHealthService,
} from '@/services/health';

interface UseHealthDataReturn {
  // 状态
  connectionStatus: HealthConnectionStatus | null;
  permissions: HealthPermissions | null;
  isLoading: boolean;
  error: string | null;

  // 操作
  checkAvailability: () => Promise<boolean>;
  requestPermissions: () => Promise<HealthPermissions>;
  checkPermissions: () => Promise<HealthPermissions>;
  getConnectionStatus: () => Promise<HealthConnectionStatus>;
  syncData: () => Promise<HealthSyncResult>;
  disconnect: () => Promise<void>;
}

/**
 * 健康数据 Hook
 *
 * @example
 * ```tsx
 * const {
 *   connectionStatus,
 *   requestPermissions,
 *   syncData,
 *   isLoading,
 * } = useHealthData();
 *
 * // 请求权限
 * await requestPermissions();
 *
 * // 同步数据
 * const result = await syncData();
 * ```
 */
export function useHealthData(): UseHealthDataReturn {
  const [connectionStatus, setConnectionStatus] = useState<HealthConnectionStatus | null>(null);
  const [permissions, setPermissions] = useState<HealthPermissions | null>(null);
  // P2-23：loading 拆桶 —— 不同操作域独立 boolean，避免 UI 互相干扰
  const [loading, setLoading] = useState({
    sync: false,
    requestPermission: false,
    checkStatus: false,
    disconnect: false,
  });
  const [error, setError] = useState<string | null>(null);

  const getService = useCallback((): HealthDataService => {
    return getHealthService();
  }, []);

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      setLoading((s) => ({ ...s, checkStatus: true }));
      setError(null);

      const service = getService();
      const available = await service.isAvailable();
      return available;
    } catch (err) {
      const message = err instanceof Error ? err.message : '检查健康平台可用性失败';
      setError(message);
      logger.error('[useHealthData] checkAvailability 失败:', err);
      return false;
    } finally {
      setLoading((s) => ({ ...s, checkStatus: false }));
    }
  }, [getService]);

  const requestPermissions = useCallback(async (): Promise<HealthPermissions> => {
    try {
      setLoading((s) => ({ ...s, requestPermission: true }));
      setError(null);

      const service = getService();
      const result = await service.requestPermissions();
      setPermissions(result);

      const status = await service.getConnectionStatus();
      setConnectionStatus(status);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '请求权限失败';
      setError(message);
      logger.error('[useHealthData] requestPermissions 失败:', err);
      throw err;
    } finally {
      setLoading((s) => ({ ...s, requestPermission: false }));
    }
  }, [getService]);

  const checkPermissions = useCallback(async (): Promise<HealthPermissions> => {
    try {
      setLoading((s) => ({ ...s, checkStatus: true }));
      setError(null);

      const service = getService();
      const result = await service.checkPermissions();
      setPermissions(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '检查权限失败';
      setError(message);
      logger.error('[useHealthData] checkPermissions 失败:', err);
      throw err;
    } finally {
      setLoading((s) => ({ ...s, checkStatus: false }));
    }
  }, [getService]);

  const getConnectionStatus = useCallback(async (): Promise<HealthConnectionStatus> => {
    try {
      setLoading((s) => ({ ...s, checkStatus: true }));
      setError(null);

      const service = getService();
      const status = await service.getConnectionStatus();
      setConnectionStatus(status);
      return status;
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取连接状态失败';
      setError(message);
      logger.error('[useHealthData] getConnectionStatus 失败:', err);
      throw err;
    } finally {
      setLoading((s) => ({ ...s, checkStatus: false }));
    }
  }, [getService]);

  const syncData = useCallback(async (): Promise<HealthSyncResult> => {
    try {
      setLoading((s) => ({ ...s, sync: true }));
      setError(null);

      const service = getService();
      const result = await service.syncData();

      if (!result.success) {
        setError(result.message);
      }

      // 更新连接状态
      const status = await service.getConnectionStatus();
      setConnectionStatus(status);

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '同步数据失败';
      setError(message);
      logger.error('[useHealthData] syncData 失败:', err);
      throw err;
    } finally {
      setLoading((s) => ({ ...s, sync: false }));
    }
  }, [getService]);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      setLoading((s) => ({ ...s, disconnect: true }));
      setError(null);

      const service = getService();
      await service.disconnect();

      setConnectionStatus({
        isConnected: false,
        platform: service.getPlatformName() as any,
      });
      setPermissions(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '断开连接失败';
      setError(message);
      logger.error('[useHealthData] disconnect 失败:', err);
      throw err;
    } finally {
      setLoading((s) => ({ ...s, disconnect: false }));
    }
  }, [getService]);

  // 暴露兼容旧 isLoading 字段（任一 loading 桶 true 即为 loading）
  const isLoading =
    loading.sync || loading.requestPermission || loading.checkStatus || loading.disconnect;

  return {
    connectionStatus,
    permissions,
    isLoading,
    error,

    checkAvailability,
    requestPermissions,
    checkPermissions,
    getConnectionStatus,
    syncData,
    disconnect,
  };
}
