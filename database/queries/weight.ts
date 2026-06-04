// database/queries/weight.ts
// 体重记录查询

import { database } from '../index';
import { WeightRecord } from '@/types/weight';

export const weightQueries = {
  /**
   * 获取最新记录
   */
  async getLatest(): Promise<WeightRecord | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<WeightRecord>(
      `SELECT
        id,
        timestamp,
        weight,
        body_fat_percentage AS "bodyFatPercentage",
        muscle_mass AS "muscleMass",
        source,
        note,
        created_at AS "createdAt"
       FROM weight_records
       ORDER BY timestamp DESC
       LIMIT 1`
    );
  },

  /**
   * 获取指定日期的记录
   */
  async getByDate(date: string): Promise<WeightRecord | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<WeightRecord>(
      `SELECT
        id,
        timestamp,
        weight,
        body_fat_percentage AS "bodyFatPercentage",
        muscle_mass AS "muscleMass",
        source,
        note,
        created_at AS "createdAt"
       FROM weight_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [date]
    );
  },

  /**
   * 获取日期范围内的记录
   */
  async getByDateRange(startDate: string, endDate: string): Promise<WeightRecord[]> {
    const db = database.getDatabase();
    return db.getAllAsync<WeightRecord>(
      `SELECT
        id,
        timestamp,
        weight,
        body_fat_percentage AS "bodyFatPercentage",
        muscle_mass AS "muscleMass",
        source,
        note,
        created_at AS "createdAt"
       FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate]
    );
  },

  /**
   * 获取最近 N 条记录
   */
  async getRecent(limit: number = 30): Promise<WeightRecord[]> {
    const db = database.getDatabase();
    return db.getAllAsync<WeightRecord>(
      `SELECT
        id,
        timestamp,
        weight,
        body_fat_percentage AS "bodyFatPercentage",
        muscle_mass AS "muscleMass",
        source,
        note,
        created_at AS "createdAt"
       FROM weight_records
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    );
  },

  /**
   * 获取体重统计
   */
  async getStats(
    startDate: string,
    endDate: string
  ): Promise<{
    min: number;
    max: number;
    avg: number;
    first: number;
    last: number;
    change: number;
  } | null> {
    const db = database.getDatabase();
    const result = await db.getFirstAsync(
      `SELECT
        MIN(weight) as min,
        MAX(weight) as max,
        AVG(weight) as avg
       FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    if (!result || !result.min) return null;

    const first = await db.getFirstAsync<{ weight: number }>(
      `SELECT weight FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC
       LIMIT 1`,
      [startDate, endDate]
    );

    const last = await db.getFirstAsync<{ weight: number }>(
      `SELECT weight FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [startDate, endDate]
    );

    return {
      min: result.min,
      max: result.max,
      avg: Math.round(result.avg * 10) / 10,
      first: first?.weight || 0,
      last: last?.weight || 0,
      change: last && first ? Math.round((last.weight - first.weight) * 10) / 10 : 0,
    };
  },

  /**
   * 每日体重（用于趋势图）
   */
  async getDailyWeights(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; weight: number }[]> {
    const db = database.getDatabase();
    return db.getAllAsync(
      `SELECT
        date(timestamp) as date,
        weight
       FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY date(timestamp)
       ORDER BY date ASC`,
      [startDate, endDate]
    );
  },

  /**
   * 根据 ID 获取记录
   */
  async getById(id: number): Promise<WeightRecord | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<WeightRecord>(
      `SELECT
        id,
        timestamp,
        weight,
        body_fat_percentage AS "bodyFatPercentage",
        muscle_mass AS "muscleMass",
        source,
        note,
        created_at AS "createdAt"
       FROM weight_records WHERE id = ?`,
      [id]
    );
  },

  /**
   * 插入记录
   */
  async insert(record: {
    timestamp: string;
    weight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    source?: string;
    note?: string;
  }): Promise<number> {
    const db = database.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO weight_records (
        timestamp, weight, body_fat_percentage, muscle_mass,
        source, note
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        record.timestamp,
        record.weight,
        record.bodyFatPercentage || null,
        record.muscleMass || null,
        record.source || 'manual',
        record.note || null,
      ]
    );
    return result.lastInsertRowId;
  },

  /**
   * 删除记录
   */
  async delete(id: number): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM weight_records WHERE id = ?', [id]);
  },

  /**
   * 获取记录数量
   */
  async getCount(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM weight_records'
    );
    return result?.count || 0;
  },
};
