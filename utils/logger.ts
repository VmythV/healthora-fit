// utils/logger.ts
// 可配置的日志工具，支持全局开关

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEBUG_MODE_KEY = '@healthora:debugMode';

/**
 * 日志工具类
 *
 * 默认开启调试模式。可通过 AsyncStorage 持久化开关状态。
 * 当调试模式关闭时，所有 log/warn/error 均不输出。
 *
 * @example
 * ```ts
 * import { logger } from '@/utils/logger';
 *
 * // 初始化（在 app/_layout.tsx 中调用一次）
 * await logger.init();
 *
 * // 输出日志
 * logger.log('[AI] 开始分析...');
 * logger.error('[AI] 分析失败:', error);
 *
 * // 切换调试模式
 * await logger.setEnabled(false);
 * ```
 */
class Logger {
  private enabled: boolean = true;
  // P3-45：写盘防抖 timer
  private writeTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 从 AsyncStorage 加载调试模式状态
   * 应在 App 启动时调用一次
   */
  async init(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(DEBUG_MODE_KEY);
      // stored === 'false' 时关闭，其他情况（null/missing/true）默认开启
      this.enabled = stored !== 'false';
    } catch {
      // AsyncStorage 读取失败时保持默认值，不抛出异常
    }
  }

  /**
   * 设置调试模式并持久化
   *
   * P3-45：写盘加 300ms 防抖 —— 防止用户在设置页快速来回拨 Switch
   * 时产生多次磁盘 IO。AsyncStorage 单次写盘有 30-50ms 序列化 + 系统调用开销。
   *
   * 注意：此实例是 App 生命周期单例，无需 dispose。
   * AsyncStorage 自身由系统管理（iOS Keychain / Android SharedPreferences），
   * 不需要手动释放。
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      AsyncStorage.setItem(DEBUG_MODE_KEY, String(enabled)).catch(() => {
        // 写盘失败时静默处理
      });
      this.writeTimer = null;
    }, 300);
  }

  /**
   * 获取当前调试模式状态
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 普通日志（仅调试模式开启时输出）
   */
  log(...args: unknown[]): void {
    if (this.enabled) {
      console.log(...args);
    }
  }

  /**
   * 警告日志（仅调试模式开启时输出）
   */
  warn(...args: unknown[]): void {
    if (this.enabled) {
      console.warn(...args);
    }
  }

  /**
   * 错误日志（仅调试模式开启时输出）
   */
  error(...args: unknown[]): void {
    if (this.enabled) {
      console.error(...args);
    }
  }
}

export const logger = new Logger();
