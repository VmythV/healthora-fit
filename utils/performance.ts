// utils/performance.ts
// 性能优化工具

import { logger } from '@/utils/logger';
import { useCallback, useRef, useMemo } from 'react';

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 防抖 Hook
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, wait);
    },
    [func, wait]
  ) as T;
}

/**
 * 节流 Hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  const inThrottleRef = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        func(...args);
        inThrottleRef.current = true;

        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    [func, limit]
  ) as T;
}

/**
 * 记忆化 Hook
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  return useCallback(callback, deps);
}

/**
 * 延迟加载工具
 */
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  delay: number = 0
): () => Promise<T> {
  let cached: T | null = null;
  let loading = false;
  let loadPromise: Promise<T> | null = null;

  return async () => {
    if (cached) {
      return cached;
    }

    if (loading && loadPromise) {
      return loadPromise;
    }

    loading = true;
    loadPromise = new Promise(async (resolve, reject) => {
      try {
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }

        const result = await loader();
        cached = result;
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        loading = false;
        loadPromise = null;
      }
    });

    return loadPromise;
  };
}

/**
 * 批处理工具
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private processFn: (items: T[]) => Promise<void>;
  private delay: number;

  constructor(
    processFn: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    this.process();
  }

  addMany(items: T[]): void {
    this.queue.push(...items);
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      try {
        await this.processFn(batch);
      } catch (error) {
        logger.error('[BatchProcessor] Error processing batch:', error);
      }

      if (this.delay > 0 && this.queue.length > 0) {
        await new Promise((r) => setTimeout(r, this.delay));
      }
    }

    this.processing = false;
  }

  clear(): void {
    this.queue = [];
  }

  get size(): number {
    return this.queue.length;
  }
}

/**
 * 缓存工具
 */
export class Cache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) {
    this.ttl = ttl;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * 图片预加载
 */
export function preloadImage(uri: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = uri;
  });
}

/**
 * 批量图片预加载
 */
export async function preloadImages(uris: string[]): Promise<void> {
  await Promise.all(uris.map(preloadImage));
}

/**
 * 测量执行时间
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  logger.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);

  return result;
}

/**
 * 内存使用监控
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }

  return null;
}
