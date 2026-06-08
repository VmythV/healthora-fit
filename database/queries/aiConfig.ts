// database/queries/aiConfig.ts
// AI 配置查询
//
// P0.1 加固：
// - 写入前 secureStoreApiKey(plain) 拿 handle 存 DB，标记 is_encrypted=1
// - 读取时 readApiKey(handle) 反查明文
// - 历史明文（is_encrypted=0）按用户决定不迁移，直接返回
//
// P0.4 重构：
// - testConnection 抽出到 services/aiConnection.ts 共享

import { logger } from '@/utils/logger';
import { database } from '../index';
import { AIConfig } from '@/types/ai';
import {
  secureStoreApiKey,
  readApiKey,
  deleteApiKey,
  isSecureHandle,
  isSecureStoreAvailable,
} from '@/utils/secureStorage';
import { testActiveConfig } from '@/services/aiConnection';

const SELECT_COLS = `id, api_endpoint as apiEndpoint, api_key as apiKey, model_name as modelName,
        is_active as isActive, is_encrypted as isEncrypted,
        created_at as createdAt, updated_at as updatedAt`;

/**
 * 把 DB 行还原为 AIConfig（必要时反查 SecureStore）
 */
async function hydrateApiKey(row: any): Promise<AIConfig> {
  if (row.isEncrypted === 1 && isSecureHandle(row.apiKey)) {
    const apiKey = await readApiKey(row.apiKey);
    return { ...row, apiKey };
  }
  // 历史明文直接返回
  return row as AIConfig;
}

export const aiConfigQueries = {
  /**
   * 获取激活的配置
   */
  async getActive(): Promise<AIConfig | null> {
    const db = database.getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT ${SELECT_COLS}
       FROM ai_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`
    );
    if (!row) return null;
    return hydrateApiKey(row);
  },

  /**
   * 获取所有配置
   */
  async getAll(): Promise<AIConfig[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT ${SELECT_COLS}
       FROM ai_config ORDER BY created_at DESC`
    );
    return Promise.all(rows.map(hydrateApiKey));
  },

  /**
   * 保存配置
   *
   * - 若已存在激活配置 → UPDATE（顺手清掉旧句柄、写入新句柄）
   * - 若不存在 → INSERT，标记 is_active=1
   *
   * P2-30：原 this.getActive() 会 hydrate 完整 AIConfig（包含反查 SecureStore 明文），
   * 这里只需要 id + api_key + is_encrypted 三列 —— 内联 SQL 节省一次 SecureStore IO。
   */
  async save(config: {
    apiEndpoint: string;
    apiKey: string;
    modelName: string;
  }): Promise<number> {
    const db = database.getDatabase();

    // 加密 api_key
    const secureAvailable = await isSecureStoreAvailable();
    let storedKey: string;
    let isEncrypted: 0 | 1;
    if (secureAvailable) {
      storedKey = await secureStoreApiKey(config.apiKey);
      isEncrypted = 1;
    } else {
      logger.warn('[AI Config] SecureStore 不可用，降级为明文存储');
      storedKey = config.apiKey;
      isEncrypted = 0;
    }

    // P2-30：内联 SQL 查 id + api_key + is_encrypted（不 hydrate 明文）
    const existing = await db.getFirstAsync<{
      id: number;
      api_key: string;
      is_encrypted: number;
    }>(
      `SELECT id, api_key, is_encrypted FROM ai_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`
    );

    if (existing) {
      // 清理旧句柄（若以前是加密的）
      if (existing.is_encrypted === 1 && isSecureHandle(existing.api_key)) {
        await deleteApiKey(existing.api_key);
      }
      await db.runAsync(
        `UPDATE ai_config
         SET api_endpoint = ?, api_key = ?, is_encrypted = ?,
             model_name = ?, updated_at = datetime('now', 'localtime')
         WHERE id = ?`,
        [config.apiEndpoint, storedKey, isEncrypted, config.modelName, existing.id]
      );
      return existing.id;
    } else {
      const result = await db.runAsync(
        `INSERT INTO ai_config (api_endpoint, api_key, is_encrypted, model_name, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [config.apiEndpoint, storedKey, isEncrypted, config.modelName]
      );
      return result.lastInsertRowId;
    }
  },

  /**
   * 更新配置
   */
  async update(id: number, updates: Partial<{
    apiEndpoint: string;
    apiKey: string;
    modelName: string;
    isActive: boolean;
  }>): Promise<void> {
    const db = database.getDatabase();

    // 如果要设置为激活，先将其他配置设为非激活
    if (updates.isActive) {
      await db.runAsync(`UPDATE ai_config SET is_active = 0 WHERE id != ?`, [id]);
    }

    // 若更新 apiKey，加密后入库
    let storedKey: string | undefined;
    let isEncrypted: 0 | 1 | undefined;
    if (updates.apiKey !== undefined) {
      const secureAvailable = await isSecureStoreAvailable();
      if (secureAvailable) {
        storedKey = await secureStoreApiKey(updates.apiKey);
        isEncrypted = 1;
      } else {
        logger.warn('[AI Config] SecureStore 不可用，apiKey 降级为明文');
        storedKey = updates.apiKey;
        isEncrypted = 0;
      }
      // 清理旧句柄
      const all = await db.getAllAsync<any>(
        `SELECT api_key FROM ai_config WHERE id = ?`,
        [id]
      );
      const oldHandle = all[0]?.api_key;
      if (oldHandle && isSecureHandle(oldHandle)) {
        await deleteApiKey(oldHandle);
      }
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.apiEndpoint !== undefined) {
      setClauses.push('api_endpoint = ?');
      params.push(updates.apiEndpoint);
    }
    if (storedKey !== undefined) {
      setClauses.push('api_key = ?');
      params.push(storedKey);
    }
    if (isEncrypted !== undefined) {
      setClauses.push('is_encrypted = ?');
      params.push(isEncrypted);
    }
    if (updates.modelName !== undefined) {
      setClauses.push('model_name = ?');
      params.push(updates.modelName);
    }
    if (updates.isActive !== undefined) {
      setClauses.push('is_active = ?');
      params.push(updates.isActive ? 1 : 0);
    }

    if (setClauses.length === 0) return;

    params.push(id);
    await db.runAsync(
      `UPDATE ai_config SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
  },

  /**
   * 删除配置
   */
  async delete(id: number): Promise<void> {
    const db = database.getDatabase();
    // 顺手清掉 SecureStore 句柄
    const rows = await db.getAllAsync<any>(
      `SELECT api_key, is_encrypted FROM ai_config WHERE id = ?`,
      [id]
    );
    const row = rows[0];
    if (row?.is_encrypted === 1 && isSecureHandle(row.api_key)) {
      await deleteApiKey(row.api_key);
    }
    await db.runAsync('DELETE FROM ai_config WHERE id = ?', [id]);
  },

  /**
   * 测试连接（薄包装，共享 services/aiConnection.testActiveConfig 的实现）
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const config = await this.getActive();
    if (!config) {
      return { success: false, error: 'AI 服务未配置' };
    }

    const apiType: 'chat-completions' | 'responses' | undefined =
      config.apiEndpoint?.endsWith('/responses') ? 'responses' : undefined;

    return testActiveConfig({
      endpoint: config.apiEndpoint || '',
      apiKey: config.apiKey || '',
      model: config.modelName || '',
      apiType,
    });
  },
};
