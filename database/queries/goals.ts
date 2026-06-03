// database/queries/goals.ts
// 目标设置查询

import { database } from '../index';
import { Goal } from '@/types/goal';

export const goalQueries = {
  /**
   * 获取激活的目标
   */
  async getActive(type?: string): Promise<Goal | null> {
    const db = database.getDatabase();
    let query = `SELECT * FROM goals WHERE is_active = 1`;
    const params: any[] = [];

    if (type) {
      query += ` AND goal_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT 1`;
    return db.getFirstAsync<Goal>(query, params);
  },

  /**
   * 获取所有目标
   */
  async getAll(): Promise<Goal[]> {
    const db = database.getDatabase();
    return db.getAllAsync<Goal>(
      `SELECT * FROM goals ORDER BY created_at DESC`
    );
  },

  /**
   * 根据类型获取目标
   */
  async getByType(goalType: string): Promise<Goal | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<Goal>(
      `SELECT * FROM goals
       WHERE goal_type = ? AND is_active = 1
       ORDER BY created_at DESC
       LIMIT 1`,
      [goalType]
    );
  },

  /**
   * 设置目标
   */
  async set(goal: {
    goalType: string;
    targetValue: number;
    startValue?: number;
    startDate?: string;
    targetDate?: string;
  }): Promise<number> {
    const db = database.getDatabase();

    // 先将同类型的目标设为非激活
    await db.runAsync(
      `UPDATE goals SET is_active = 0 WHERE goal_type = ?`,
      [goal.goalType]
    );

    // 插入新目标
    const result = await db.runAsync(
      `INSERT INTO goals (
        goal_type, target_value, start_value,
        start_date, target_date, is_active
      ) VALUES (?, ?, ?, ?, ?, 1)`,
      [
        goal.goalType,
        goal.targetValue,
        goal.startValue || null,
        goal.startDate || null,
        goal.targetDate || null,
      ]
    );
    return result.lastInsertRowId;
  },

  /**
   * 更新目标
   */
  async update(id: number, updates: Partial<{
    targetValue: number;
    targetDate: string;
    isActive: boolean;
  }>): Promise<void> {
    const db = database.getDatabase();
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.targetValue !== undefined) {
      setClauses.push('target_value = ?');
      params.push(updates.targetValue);
    }
    if (updates.targetDate !== undefined) {
      setClauses.push('target_date = ?');
      params.push(updates.targetDate);
    }
    if (updates.isActive !== undefined) {
      setClauses.push('is_active = ?');
      params.push(updates.isActive ? 1 : 0);
    }

    if (setClauses.length === 0) return;

    params.push(id);
    await db.runAsync(
      `UPDATE goals SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
  },

  /**
   * 删除目标
   */
  async delete(id: number): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
  },

  /**
   * 停用目标
   */
  async deactivate(id: number): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync(
      `UPDATE goals SET is_active = 0 WHERE id = ?`,
      [id]
    );
  },
};
