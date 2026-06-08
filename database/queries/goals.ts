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
    let query = `SELECT
      id,
      goal_type AS "goalType",
      target_value AS "targetValue",
      start_value AS "startValue",
      start_date AS "startDate",
      target_date AS "targetDate",
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
     FROM goals WHERE is_active = 1`;
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
      `SELECT
        id,
        goal_type AS "goalType",
        target_value AS "targetValue",
        start_value AS "startValue",
        start_date AS "startDate",
        target_date AS "targetDate",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM goals ORDER BY created_at DESC`
    );
  },

  /**
   * 根据类型获取目标
   */
  async getByType(goalType: string): Promise<Goal | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<Goal>(
      `SELECT
        id,
        goal_type AS "goalType",
        target_value AS "targetValue",
        start_value AS "startValue",
        start_date AS "startDate",
        target_date AS "targetDate",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM goals
       WHERE goal_type = ? AND is_active = 1
       ORDER BY created_at DESC
       LIMIT 1`,
      [goalType]
    );
  },

  /**
   * 设置目标
   *
   * P3-38：原"DELETE WHERE id NOT IN (SELECT ... LIMIT 4)"子查询
   * 拆为两段：先 SELECT id，再 DELETE WHERE id NOT IN (...)。
   * SQLite 3.40+ 上单条子查询也稳，但拆开后更可读、避免 NOT IN
   * 语义边缘 case。性能几乎无差异（目标表行数极小）。
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

    // P3-38：两段法 —— 先查保留的 4 条 id，再 DELETE
    const keepIds = await db.getAllAsync<{ id: number }>(
      `SELECT id FROM goals
       WHERE goal_type = ? AND is_active = 0
       ORDER BY created_at DESC
       LIMIT 4`,
      [goal.goalType]
    );
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await db.runAsync(
        `DELETE FROM goals
         WHERE goal_type = ? AND is_active = 0
           AND id NOT IN (${placeholders})`,
        [goal.goalType, ...keepIds.map((r) => r.id)]
      );
    } else {
      await db.runAsync(
        `DELETE FROM goals WHERE goal_type = ? AND is_active = 0`,
        [goal.goalType]
      );
    }

    return result.lastInsertRowId;
  },

  /**
   * 更新目标
   *
   * P2-25：支持全字段（goalType / targetValue / startValue / startDate / targetDate / isActive），
   * 自动触 updated_at。
   */
  async update(id: number, updates: Partial<{
    goalType: string;
    targetValue: number;
    startValue: number | null;
    startDate: string | null;
    targetDate: string | null;
    isActive: boolean;
  }>): Promise<void> {
    const db = database.getDatabase();
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.goalType !== undefined) {
      setClauses.push('goal_type = ?');
      params.push(updates.goalType);
    }
    if (updates.targetValue !== undefined) {
      setClauses.push('target_value = ?');
      params.push(updates.targetValue);
    }
    if (updates.startValue !== undefined) {
      setClauses.push('start_value = ?');
      params.push(updates.startValue);
    }
    if (updates.startDate !== undefined) {
      setClauses.push('start_date = ?');
      params.push(updates.startDate);
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

    // P2-25：自动触 updated_at
    setClauses.push("updated_at = datetime('now', 'localtime')");

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
