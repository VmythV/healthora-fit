// database/index.ts
// 数据库初始化和管理

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

const DB_NAME = 'healthora.db';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[Database] 正在初始化数据库...');

      // 打开数据库
      this.db = await SQLite.openDatabaseAsync(DB_NAME);

      // 启用外键约束
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      // 执行迁移
      await runMigrations(this.db);

      this.isInitialized = true;
      console.log('[Database] 数据库初始化完成');
    } catch (error) {
      console.error('[Database] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据库实例
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用 initialize()');
    }
    return this.db;
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * 清空所有数据（危险操作）
   */
  async clearAll(): Promise<void> {
    const db = this.getDatabase();
    await db.execAsync(`
      DELETE FROM diet_records;
      DELETE FROM exercise_records;
      DELETE FROM weight_records;
      DELETE FROM goals;
      DELETE FROM ai_config;
      DELETE FROM sync_log;
    `);
  }

  /**
   * 获取数据库大小（近似值）
   */
  async getSize(): Promise<number> {
    const db = this.getDatabase();
    const result = await db.getFirstAsync<{ page_count: number; page_size: number }>(
      'SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()'
    );
    return result?.size || 0;
  }
}

// 导出单例
export const database = new Database();

// 导出类型
export type { SQLite };
