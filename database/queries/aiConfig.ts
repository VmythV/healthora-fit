// database/queries/aiConfig.ts
// AI 配置查询

import { database } from '../index';
import { AIConfig } from '@/types/ai';

export const aiConfigQueries = {
  /**
   * 获取激活的配置
   */
  async getActive(): Promise<AIConfig | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<AIConfig>(
      `SELECT * FROM ai_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`
    );
  },

  /**
   * 获取所有配置
   */
  async getAll(): Promise<AIConfig[]> {
    const db = database.getDatabase();
    return db.getAllAsync<AIConfig>(
      `SELECT * FROM ai_config ORDER BY created_at DESC`
    );
  },

  /**
   * 保存配置
   */
  async save(config: {
    apiEndpoint: string;
    apiKey: string;
    modelName: string;
  }): Promise<number> {
    const db = database.getDatabase();

    // 先将所有配置设为非激活
    await db.runAsync(`UPDATE ai_config SET is_active = 0`);

    // 插入新配置
    const result = await db.runAsync(
      `INSERT INTO ai_config (api_endpoint, api_key, model_name, is_active)
       VALUES (?, ?, ?, 1)`,
      [config.apiEndpoint, config.apiKey, config.modelName]
    );
    return result.lastInsertRowId;
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
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.apiEndpoint !== undefined) {
      setClauses.push('api_endpoint = ?');
      params.push(updates.apiEndpoint);
    }
    if (updates.apiKey !== undefined) {
      setClauses.push('api_key = ?');
      params.push(updates.apiKey);
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
    await db.runAsync('DELETE FROM ai_config WHERE id = ?', [id]);
  },

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    const config = await this.getActive();
    if (!config) {
      return false;
    }

    try {
      const response = await fetch(`${config.apiEndpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
