// database/queries/weight.ts
// 体重记录查询

import { database } from '../index'
import { WeightRecord } from '@/types/weight'

/**
 * P3-39：导出/单次取记录上限。
 * 理论安全值（按 1 天 1 次 = 27 年），实际不会触达。
 */
export const MAX_EXPORT_RECORDS = 10000

export const weightQueries = {
  /**
   * 获取最新记录
   */
  async getLatest(): Promise<WeightRecord | null> {
    const db = database.getDatabase()
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
    )
  },

  /**
   * 获取指定日期的记录
   */
  async getByDate(date: string): Promise<WeightRecord | null> {
    const db = database.getDatabase()
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
    )
  },

  /**
   * 获取日期范围内的记录
   */
  async getByDateRange(startDate: string, endDate: string): Promise<WeightRecord[]> {
    const db = database.getDatabase()
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
    )
  },

  /**
   * 获取最近 N 条记录
   */
  async getRecent(limit: number = 30): Promise<WeightRecord[]> {
    const db = database.getDatabase()
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
    )
  },

  /**
   * 获取体重统计
   *
   * P0.3 合并：原本 3 次串行查询（MIN/MAX/AVG + first + last）改为单条 SQL。
   * 使用子查询保证兼容性（expo-sqlite 16.x 自带 SQLite 3.40+ 也支持窗口函数，
   * 但子查询版本更稳，未来降级 SQLite 也不怕）。
   */
  async getStats(
    startDate: string,
    endDate: string
  ): Promise<{
    min: number
    max: number
    avg: number
    first: number
    last: number
    change: number
  } | null> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync<{
      min: number | null
      max: number | null
      avg: number | null
      first: number | null
      last: number | null
    }>(
      `SELECT
        (SELECT MIN(weight) FROM weight_records
         WHERE date(timestamp) BETWEEN ? AND ?) as min,
        (SELECT MAX(weight) FROM weight_records
         WHERE date(timestamp) BETWEEN ? AND ?) as max,
        (SELECT AVG(weight) FROM weight_records
         WHERE date(timestamp) BETWEEN ? AND ?) as avg,
        (SELECT weight FROM weight_records
         WHERE date(timestamp) BETWEEN ? AND ?
         ORDER BY timestamp ASC LIMIT 1) as first,
        (SELECT weight FROM weight_records
         WHERE date(timestamp) BETWEEN ? AND ?
         ORDER BY timestamp DESC LIMIT 1) as last`,
      [
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
      ]
    )

    if (!result || result.min === null || result.max === null) return null

    const first = result.first ?? 0
    const last = result.last ?? 0

    return {
      min: result.min,
      max: result.max,
      avg: Math.round((result.avg ?? 0) * 10) / 10,
      first,
      last,
      change: first && last ? Math.round((last - first) * 10) / 10 : 0,
    }
  },

  /**
   * 每日体重（用于趋势图）
   */
  async getDailyWeights(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; weight: number }[]> {
    const db = database.getDatabase()
    return db.getAllAsync(
      `SELECT
        date(timestamp) as date,
        weight
       FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY date(timestamp)
       ORDER BY date ASC`,
      [startDate, endDate]
    )
  },

  /**
   * 根据 ID 获取记录
   */
  async getById(id: number): Promise<WeightRecord | null> {
    const db = database.getDatabase()
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
    )
  },

  /**
   * 插入记录
   */
  async insert(record: {
    timestamp: string
    weight: number
    bodyFatPercentage?: number
    muscleMass?: number
    source?: string
    note?: string
  }): Promise<number> {
    const db = database.getDatabase()
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
    )
    return result.lastInsertRowId
  },

  /**
   * 删除记录
   */
  async delete(id: number): Promise<void> {
    const db = database.getDatabase()
    await db.runAsync('DELETE FROM weight_records WHERE id = ?', [id])
  },

  /**
   * 获取记录数量
   */
  async getCount(): Promise<number> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM weight_records'
    )
    return result?.count || 0
  },

  /**
   * P2-36：根据 timestamp 查单条
   */
  async findByTimestamp(timestamp: string): Promise<WeightRecord | null> {
    const db = database.getDatabase()
    return db.getFirstAsync<WeightRecord>(
      'SELECT * FROM weight_records WHERE timestamp = ? LIMIT 1',
      [timestamp]
    )
  },

  /**
   * P2-18：批量插入
   */
  async insertMany(
    records: {
      timestamp: string
      weight: number
      bodyFatPercentage?: number
      muscleMass?: number
      source?: string
      note?: string
    }[]
  ): Promise<{ inserted: number; skipped: number }> {
    if (records.length === 0) return { inserted: 0, skipped: 0 }
    const db = database.getDatabase()
    let inserted = 0
    let skipped = 0

    const CHUNK = 500
    for (let i = 0; i < records.length; i += CHUNK) {
      const chunk = records.slice(i, i + CHUNK)
      const existingTs = new Set<string>()
      for (const r of chunk) existingTs.add(r.timestamp)
      const existingRows = await db.getAllAsync<{ timestamp: string }>(
        `SELECT timestamp FROM weight_records WHERE timestamp IN (${Array.from(existingTs)
          .map(() => '?')
          .join(',')})`,
        Array.from(existingTs)
      )
      const existingSet = new Set(existingRows.map((r) => r.timestamp))

      const toInsert = chunk.filter((r) => !existingSet.has(r.timestamp))
      skipped += chunk.length - toInsert.length
      if (toInsert.length === 0) continue

      const cols = 6
      const placeholders = toInsert.map(() => `(${Array(cols).fill('?').join(',')})`).join(',')
      const flatParams: any[] = []
      for (const r of toInsert) {
        flatParams.push(
          r.timestamp,
          r.weight,
          r.bodyFatPercentage || null,
          r.muscleMass || null,
          r.source || 'manual',
          r.note || null
        )
      }
      await db.runAsync(
        `INSERT INTO weight_records (timestamp, weight, body_fat_percentage, muscle_mass, source, note) VALUES ${placeholders}`,
        flatParams
      )
      inserted += toInsert.length
    }
    return { inserted, skipped }
  },
}
