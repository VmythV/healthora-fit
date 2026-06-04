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
   *
   * 支持多种 API 提供商：
   * - OpenAI 兼容 API（使用 /models 端点）
   * - 火山引擎等（使用简单聊天请求测试）
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const config = await this.getActive();
    if (!config) {
      return { success: false, error: 'AI 服务未配置' };
    }

    try {
      // 首先尝试 /models 端点（适用于 OpenAI 兼容 API）
      try {
        const modelsResponse = await fetch(`${config.apiEndpoint}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (modelsResponse.ok) {
          return { success: true };
        }
      } catch (e) {
        // /models 端点不可用，继续尝试其他方式
      }

      // 如果 /models 不可用，发送一个简单的聊天请求测试
      const chatResponse = await fetch(`${config.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [
            {
              role: 'user',
              content: 'Hi',
            },
          ],
          max_tokens: 5,
        }),
      });

      if (chatResponse.ok) {
        return { success: true };
      }

      // 解析错误信息
      let errorMessage = '连接失败';
      try {
        const errorData = await chatResponse.json();
        errorMessage = errorData.error?.message || errorData.message || `HTTP ${chatResponse.status}`;
      } catch {
        errorMessage = `HTTP ${chatResponse.status}`;
      }

      return { success: false, error: errorMessage };
    } catch (error) {
      console.error('测试连接失败:', error);
      const message = error instanceof Error ? error.message : '网络连接失败';
      return { success: false, error: message };
    }
  },
};
