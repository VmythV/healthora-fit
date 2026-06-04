// database/migrations.ts
// 数据库迁移管理

import { logger } from '@/utils/logger';
import { SQLite } from 'expo-sqlite';
import {
  DB_VERSION,
  CREATE_TABLES_SQL,
  CREATE_INDEXES_SQL,
  CREATE_TRIGGERS_SQL,
  CREATE_MIGRATION_TABLE_SQL,
} from './schema';

/**
 * 迁移接口
 */
interface Migration {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * 迁移列表
 */
const migrations: Migration[] = [
  {
    version: 1,
    description: '创建初始表结构',
    up: async (db) => {
      // 创建表
      await db.execAsync(CREATE_TABLES_SQL);

      // 创建索引
      await db.execAsync(CREATE_INDEXES_SQL);

      // 创建触发器
      await db.execAsync(CREATE_TRIGGERS_SQL);
    },
  },
  // 未来版本的迁移在这里添加
  // {
  //   version: 2,
  //   description: '添加新字段',
  //   up: async (db) => {
  //     await db.execAsync(`ALTER TABLE diet_records ADD COLUMN new_field TEXT;`);
  //   },
  // },
];

/**
 * 获取当前数据库版本
 */
async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    // 检查 schema_version 表是否存在
    const tableExists = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='schema_version'"
    );

    if (!tableExists || tableExists.count === 0) {
      return 0;
    }

    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM schema_version'
    );

    return result?.version || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * 执行迁移
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    logger.log('[Migration] 开始检查数据库迁移...');

    // 创建迁移版本表
    await db.execAsync(CREATE_MIGRATION_TABLE_SQL);

    // 获取当前版本
    const currentVersion = await getCurrentVersion(db);
    logger.log(`[Migration] 当前数据库版本: ${currentVersion}, 目标版本: ${DB_VERSION}`);

    // 如果已经是最新版本，直接返回
    if (currentVersion >= DB_VERSION) {
      logger.log('[Migration] 数据库已是最新版本');
      return;
    }

    // 执行未执行的迁移
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        logger.log(`[Migration] 执行迁移 v${migration.version}: ${migration.description}`);

        try {
          await migration.up(db);

          // 记录迁移
          await db.runAsync(
            'INSERT INTO schema_version (version, description) VALUES (?, ?)',
            [migration.version, migration.description]
          );

          logger.log(`[Migration] 迁移 v${migration.version} 完成`);
        } catch (error) {
          logger.error(`[Migration] 迁移 v${migration.version} 失败:`, error);
          throw error;
        }
      }
    }

    logger.log('[Migration] 所有迁移执行完成');
  } catch (error) {
    logger.error('[Migration] 迁移执行失败:', error);
    throw error;
  }
}

/**
 * 获取迁移历史
 */
export async function getMigrationHistory(
  db: SQLite.SQLiteDatabase
): Promise<{ version: number; description: string; appliedAt: string }[]> {
  try {
    const result = await db.getAllAsync<{ version: number; description: string; applied_at: string }>(
      'SELECT version, description, applied_at FROM schema_version ORDER BY version ASC'
    );

    return result.map((row) => ({
      version: row.version,
      description: row.description,
      appliedAt: row.applied_at,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * 重置数据库（危险操作）
 */
export async function resetDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  logger.log('[Migration] 正在重置数据库...');

  // 删除所有表
  await db.execAsync(`
    DROP TABLE IF EXISTS sync_log;
    DROP TABLE IF EXISTS ai_config;
    DROP TABLE IF EXISTS goals;
    DROP TABLE IF EXISTS weight_records;
    DROP TABLE IF EXISTS exercise_records;
    DROP TABLE IF EXISTS diet_records;
    DROP TABLE IF EXISTS schema_version;
  `);

  // 重新执行迁移
  await runMigrations(db);

  logger.log('[Migration] 数据库重置完成');
}
