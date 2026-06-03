// database/queries/exercise.ts
// 运动记录查询

import { database } from '../index';
import { ExerciseRecord } from '@/types/exercise';

export const exerciseQueries = {
  /**
   * 获取指定日期的记录
   */
  async getByDate(date: string): Promise<ExerciseRecord[]> {
    const db = database.getDatabase();
    return db.getAllAsync<ExerciseRecord>(
      `SELECT * FROM exercise_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [date]
    );
  },

  /**
   * 获取日期范围内的记录
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ExerciseRecord[]> {
    const db = database.getDatabase();
    return db.getAllAsync<ExerciseRecord>(
      `SELECT * FROM exercise_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate]
    );
  },

  /**
   * 获取今日记录
   */
  async getToday(): Promise<ExerciseRecord[]> {
    const db = database.getDatabase();
    const today = new Date().toISOString().split('T')[0];
    return db.getAllAsync<ExerciseRecord>(
      `SELECT * FROM exercise_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [today]
    );
  },

  /**
   * 获取今日总运动时长（分钟）
   */
  async getTodayDuration(): Promise<number> {
    const db = database.getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total
       FROM exercise_records
       WHERE date(timestamp) = ?`,
      [today]
    );
    return result?.total || 0;
  },

  /**
   * 获取今日总消耗卡路里
   */
  async getTodayCalories(): Promise<number> {
    const db = database.getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(calories_burned), 0) as total
       FROM exercise_records
       WHERE date(timestamp) = ?`,
      [today]
    );
    return result?.total || 0;
  },

  /**
   * 按日期分组的运动统计
   */
  async getDailyStats(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; duration: number; calories: number }[]> {
    const db = database.getDatabase();
    return db.getAllAsync(
      `SELECT
        date(timestamp) as date,
        SUM(duration_minutes) as duration,
        SUM(calories_burned) as calories
       FROM exercise_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY date(timestamp)
       ORDER BY date ASC`,
      [startDate, endDate]
    );
  },

  /**
   * 按运动类型统计
   */
  async getTypeStats(
    startDate: string,
    endDate: string
  ): Promise<{ exercise_type: string; count: number; total_duration: number }[]> {
    const db = database.getDatabase();
    return db.getAllAsync(
      `SELECT
        exercise_type,
        COUNT(*) as count,
        SUM(duration_minutes) as total_duration
       FROM exercise_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY exercise_type
       ORDER BY count DESC`,
      [startDate, endDate]
    );
  },

  /**
   * 根据 ID 获取记录
   */
  async getById(id: number): Promise<ExerciseRecord | null> {
    const db = database.getDatabase();
    return db.getFirstAsync<ExerciseRecord>(
      'SELECT * FROM exercise_records WHERE id = ?',
      [id]
    );
  },

  /**
   * 插入记录
   */
  async insert(record: {
    timestamp: string;
    exerciseType: string;
    durationMinutes: number;
    caloriesBurned?: number;
    distanceKm?: number;
    heartRateAvg?: number;
    source?: string;
    screenshotUri?: string;
    rawData?: string;
    note?: string;
  }): Promise<number> {
    const db = database.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO exercise_records (
        timestamp, exercise_type, duration_minutes, calories_burned,
        distance_km, heart_rate_avg, source, screenshot_uri,
        raw_data, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.timestamp,
        record.exerciseType,
        record.durationMinutes,
        record.caloriesBurned || null,
        record.distanceKm || null,
        record.heartRateAvg || null,
        record.source || 'manual',
        record.screenshotUri || null,
        record.rawData || null,
        record.note || null,
      ]
    );
    return result.lastInsertRowId;
  },

  /**
   * 更新记录
   */
  async update(id: number, updates: Partial<{
    timestamp: string;
    exerciseType: string;
    durationMinutes: number;
    caloriesBurned: number;
    distanceKm: number;
    heartRateAvg: number;
    note: string;
  }>): Promise<void> {
    const db = database.getDatabase();
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.timestamp !== undefined) {
      setClauses.push('timestamp = ?');
      params.push(updates.timestamp);
    }
    if (updates.exerciseType !== undefined) {
      setClauses.push('exercise_type = ?');
      params.push(updates.exerciseType);
    }
    if (updates.durationMinutes !== undefined) {
      setClauses.push('duration_minutes = ?');
      params.push(updates.durationMinutes);
    }
    if (updates.caloriesBurned !== undefined) {
      setClauses.push('calories_burned = ?');
      params.push(updates.caloriesBurned);
    }
    if (updates.distanceKm !== undefined) {
      setClauses.push('distance_km = ?');
      params.push(updates.distanceKm);
    }
    if (updates.heartRateAvg !== undefined) {
      setClauses.push('heart_rate_avg = ?');
      params.push(updates.heartRateAvg);
    }
    if (updates.note !== undefined) {
      setClauses.push('note = ?');
      params.push(updates.note);
    }

    if (setClauses.length === 0) return;

    params.push(id);
    await db.runAsync(
      `UPDATE exercise_records SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
  },

  /**
   * 删除记录
   */
  async delete(id: number): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM exercise_records WHERE id = ?', [id]);
  },

  /**
   * 获取记录数量
   */
  async getCount(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercise_records'
    );
    return result?.count || 0;
  },
};
