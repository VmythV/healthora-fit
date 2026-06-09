// database/queries/diet.ts
// 饮食记录查询

import { database } from '../index'
import { DietRecord } from '@/types/diet'

/**
 * P3-39：导出/单次取记录上限。
 * 理论安全值（按 1 天 1 餐 = 27 年），实际不会触达；
 * 仅用于 dataTransfer 全量备份的硬上限。
 */
export const MAX_EXPORT_RECORDS = 10000

export const dietQueries = {
  /**
   * 获取指定日期的记录
   */
  async getByDate(date: string): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT
        id,
        timestamp,
        photo_uri AS "photoUri",
        foods_json AS "foodsJson",
        total_calories AS "totalCalories",
        total_protein AS "totalProtein",
        total_carbs AS "totalCarbs",
        total_fat AS "totalFat",
        meal_type AS "mealType",
        note,
        is_edited AS "isEdited",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM diet_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [date]
    )
  },

  /**
   * 获取日期范围内的记录
   */
  async getByDateRange(startDate: string, endDate: string): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT
        id,
        timestamp,
        photo_uri AS "photoUri",
        foods_json AS "foodsJson",
        total_calories AS "totalCalories",
        total_protein AS "totalProtein",
        total_carbs AS "totalCarbs",
        total_fat AS "totalFat",
        meal_type AS "mealType",
        note,
        is_edited AS "isEdited",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate]
    )
  },

  /**
   * 获取最近 N 条记录
   */
  async getRecent(limit: number = 10): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT
        id,
        timestamp,
        photo_uri AS "photoUri",
        foods_json AS "foodsJson",
        total_calories AS "totalCalories",
        total_protein AS "totalProtein",
        total_carbs AS "totalCarbs",
        total_fat AS "totalFat",
        meal_type AS "mealType",
        note,
        is_edited AS "isEdited",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM diet_records
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    )
  },

  /**
   * 获取今日记录
   */
  async getToday(): Promise<DietRecord[]> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    return db.getAllAsync<DietRecord>(
      `SELECT
        id,
        timestamp,
        photo_uri AS "photoUri",
        foods_json AS "foodsJson",
        total_calories AS "totalCalories",
        total_protein AS "totalProtein",
        total_carbs AS "totalCarbs",
        total_fat AS "totalFat",
        meal_type AS "mealType",
        note,
        is_edited AS "isEdited",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM diet_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [today]
    )
  },

  /**
   * 获取今日总卡路里
   */
  async getTodayCalories(): Promise<number> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(total_calories), 0) as total
       FROM diet_records
       WHERE date(timestamp) = ?`,
      [today]
    )
    return result?.total || 0
  },

  /**
   * 获取今日营养成分汇总
   */
  async getTodayNutrition(): Promise<{
    calories: number
    protein: number
    carbs: number
    fat: number
  }> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    const result = await db.getFirstAsync(
      `SELECT
        COALESCE(SUM(total_calories), 0) as calories,
        COALESCE(SUM(total_protein), 0) as protein,
        COALESCE(SUM(total_carbs), 0) as carbs,
        COALESCE(SUM(total_fat), 0) as fat
       FROM diet_records
       WHERE date(timestamp) = ?`,
      [today]
    )
    return {
      calories: result?.calories || 0,
      protein: result?.protein || 0,
      carbs: result?.carbs || 0,
      fat: result?.fat || 0,
    }
  },

  /**
   * 按日期分组的卡路里统计
   */
  async getDailyCaloriesStats(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; calories: number }[]> {
    const db = database.getDatabase()
    return db.getAllAsync(
      `SELECT
        date(timestamp) as date,
        SUM(total_calories) as calories
       FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY date(timestamp)
       ORDER BY date ASC`,
      [startDate, endDate]
    )
  },

  /**
   * 按日期分组的营养成分统计
   */
  async getDailyNutritionStats(
    startDate: string,
    endDate: string
  ): Promise<
    {
      date: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }[]
  > {
    const db = database.getDatabase()
    return db.getAllAsync(
      `SELECT
        date(timestamp) as date,
        SUM(total_calories) as calories,
        SUM(total_protein) as protein,
        SUM(total_carbs) as carbs,
        SUM(total_fat) as fat
       FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY date(timestamp)
       ORDER BY date ASC`,
      [startDate, endDate]
    )
  },

  /**
   * 获取时间段内的总营养成分
   */
  async getTotalNutrition(
    startDate: string,
    endDate: string
  ): Promise<{
    calories: number
    protein: number
    carbs: number
    fat: number
    days: number
  }> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync(
      `SELECT
        COALESCE(SUM(total_calories), 0) as calories,
        COALESCE(SUM(total_protein), 0) as protein,
        COALESCE(SUM(total_carbs), 0) as carbs,
        COALESCE(SUM(total_fat), 0) as fat,
        COUNT(DISTINCT date(timestamp)) as days
       FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?`,
      [startDate, endDate]
    )
    return {
      calories: result?.calories || 0,
      protein: result?.protein || 0,
      carbs: result?.carbs || 0,
      fat: result?.fat || 0,
      days: result?.days || 0,
    }
  },

  /**
   * 按餐次统计
   */
  async getMealTypeStats(
    startDate: string,
    endDate: string
  ): Promise<{ meal_type: string; count: number; avg_calories: number }[]> {
    const db = database.getDatabase()
    return db.getAllAsync(
      `SELECT
        meal_type,
        COUNT(*) as count,
        AVG(total_calories) as avg_calories
       FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?
       GROUP BY meal_type`,
      [startDate, endDate]
    )
  },

  /**
   * 根据 ID 获取记录
   */
  async getById(id: number): Promise<DietRecord | null> {
    const db = database.getDatabase()
    return db.getFirstAsync<DietRecord>(
      `SELECT
        id,
        timestamp,
        photo_uri AS "photoUri",
        foods_json AS "foodsJson",
        total_calories AS "totalCalories",
        total_protein AS "totalProtein",
        total_carbs AS "totalCarbs",
        total_fat AS "totalFat",
        meal_type AS "mealType",
        note,
        is_edited AS "isEdited",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM diet_records WHERE id = ?`,
      [id]
    )
  },

  /**
   * 插入记录
   */
  async insert(record: {
    timestamp: string
    photoUri?: string
    foodsJson?: string
    totalCalories?: number
    totalProtein?: number
    totalCarbs?: number
    totalFat?: number
    mealType?: string
    note?: string
    isEdited?: boolean
  }): Promise<number> {
    const db = database.getDatabase()
    const result = await db.runAsync(
      `INSERT INTO diet_records (
        timestamp, photo_uri, foods_json, total_calories,
        total_protein, total_carbs, total_fat, meal_type,
        note, is_edited
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.timestamp,
        record.photoUri || null,
        record.foodsJson || null,
        record.totalCalories || null,
        record.totalProtein || null,
        record.totalCarbs || null,
        record.totalFat || null,
        record.mealType || null,
        record.note || null,
        record.isEdited ? 1 : 0,
      ]
    )
    return result.lastInsertRowId
  },

  /**
   * 更新记录
   */
  async update(
    id: number,
    updates: Partial<{
      timestamp: string
      photoUri: string
      foodsJson: string
      totalCalories: number
      totalProtein: number
      totalCarbs: number
      totalFat: number
      mealType: string
      note: string
      isEdited: boolean
    }>
  ): Promise<void> {
    const db = database.getDatabase()
    const setClauses: string[] = []
    const params: any[] = []

    if (updates.timestamp !== undefined) {
      setClauses.push('timestamp = ?')
      params.push(updates.timestamp)
    }
    if (updates.photoUri !== undefined) {
      setClauses.push('photo_uri = ?')
      params.push(updates.photoUri)
    }
    if (updates.foodsJson !== undefined) {
      setClauses.push('foods_json = ?')
      params.push(updates.foodsJson)
    }
    if (updates.totalCalories !== undefined) {
      setClauses.push('total_calories = ?')
      params.push(updates.totalCalories)
    }
    if (updates.totalProtein !== undefined) {
      setClauses.push('total_protein = ?')
      params.push(updates.totalProtein)
    }
    if (updates.totalCarbs !== undefined) {
      setClauses.push('total_carbs = ?')
      params.push(updates.totalCarbs)
    }
    if (updates.totalFat !== undefined) {
      setClauses.push('total_fat = ?')
      params.push(updates.totalFat)
    }
    if (updates.mealType !== undefined) {
      setClauses.push('meal_type = ?')
      params.push(updates.mealType)
    }
    if (updates.note !== undefined) {
      setClauses.push('note = ?')
      params.push(updates.note)
    }
    if (updates.isEdited !== undefined) {
      setClauses.push('is_edited = ?')
      params.push(updates.isEdited ? 1 : 0)
    }

    if (setClauses.length === 0) return

    params.push(id)
    await db.runAsync(`UPDATE diet_records SET ${setClauses.join(', ')} WHERE id = ?`, params)
  },

  /**
   * 删除记录
   */
  async delete(id: number): Promise<void> {
    const db = database.getDatabase()
    await db.runAsync('DELETE FROM diet_records WHERE id = ?', [id])
  },

  /**
   * 获取记录数量
   */
  async getCount(): Promise<number> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM diet_records'
    )
    return result?.count || 0
  },

  /**
   * P2-36：根据 timestamp 查单条（用于去重）
   */
  async findByTimestamp(timestamp: string): Promise<DietRecord | null> {
    const db = database.getDatabase()
    return db.getFirstAsync<DietRecord>('SELECT * FROM diet_records WHERE timestamp = ? LIMIT 1', [
      timestamp,
    ])
  },

  /**
   * P2-18：批量插入（多值 INSERT 单 SQL）
   *
   * 内部按 500/批分片，避免单条 SQL 参数过多。
   * 已存在 timestamp 的会被跳过（依赖 P2-36 findByTimestamp）。
   * 返回 { inserted, skipped }
   */
  async insertMany(
    records: {
      timestamp: string
      photoUri?: string
      foodsJson?: string
      totalCalories?: number
      totalProtein?: number
      totalCarbs?: number
      totalFat?: number
      mealType?: string
      note?: string
      isEdited?: boolean
    }[]
  ): Promise<{ inserted: number; skipped: number }> {
    if (records.length === 0) return { inserted: 0, skipped: 0 }
    const db = database.getDatabase()
    let inserted = 0
    let skipped = 0

    const CHUNK = 500
    for (let i = 0; i < records.length; i += CHUNK) {
      const chunk = records.slice(i, i + CHUNK)
      // 先查重
      const existingTs = new Set<string>()
      for (const r of chunk) existingTs.add(r.timestamp)
      const existingRows = await db.getAllAsync<{ timestamp: string }>(
        `SELECT timestamp FROM diet_records WHERE timestamp IN (${Array.from(existingTs)
          .map(() => '?')
          .join(',')})`,
        Array.from(existingTs)
      )
      const existingSet = new Set(existingRows.map((r) => r.timestamp))

      const toInsert = chunk.filter((r) => !existingSet.has(r.timestamp))
      skipped += chunk.length - toInsert.length
      if (toInsert.length === 0) continue

      // 构造多值 INSERT
      const cols = 10 // timestamp, photo_uri, foods_json, total_calories, total_protein, total_carbs, total_fat, meal_type, note, is_edited
      const placeholders = toInsert.map(() => `(${Array(cols).fill('?').join(',')})`).join(',')
      const flatParams: any[] = []
      for (const r of toInsert) {
        flatParams.push(
          r.timestamp,
          r.photoUri || null,
          r.foodsJson || null,
          r.totalCalories || null,
          r.totalProtein || null,
          r.totalCarbs || null,
          r.totalFat || null,
          r.mealType || null,
          r.note || null,
          r.isEdited ? 1 : 0
        )
      }
      await db.runAsync(
        `INSERT INTO diet_records (timestamp, photo_uri, foods_json, total_calories, total_protein, total_carbs, total_fat, meal_type, note, is_edited) VALUES ${placeholders}`,
        flatParams
      )
      inserted += toInsert.length
    }
    return { inserted, skipped }
  },

  /**
   * 获取日期范围内有记录的日期列表（用于月视图标记）
   */
  async getDatesWithRecords(startDate: string, endDate: string): Promise<string[]> {
    const db = database.getDatabase()
    const rows = await db.getAllAsync<{ date: string }>(
      `SELECT DISTINCT date(timestamp) as date
       FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY date ASC`,
      [startDate, endDate]
    )
    return rows.map((r) => r.date)
  },

  /**
   * 搜索记录（按食物名称）
   */
  async search(keyword: string): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT
        id,
        timestamp,
        photo_uri AS "photoUri",
        foods_json AS "foodsJson",
        total_calories AS "totalCalories",
        total_protein AS "totalProtein",
        total_carbs AS "totalCarbs",
        total_fat AS "totalFat",
        meal_type AS "mealType",
        note,
        is_edited AS "isEdited",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM diet_records
       WHERE foods_json LIKE ?
       ORDER BY timestamp DESC`,
      [`%${keyword}%`]
    )
  },
}
