# Healthora Fit — 数据库设计文档 v1.0

> **数据库**：SQLite（本地存储）
> **ORM**：原生 SQL 查询
> **最后更新**：2026-06-03

---

## 📊 数据库概述

### 设计原则

1. **简单优先**：结构清晰，易于维护
2. **性能优先**：合理索引，优化查询
3. **扩展性**：预留扩展空间，支持未来需求
4. **数据完整性**：使用约束保证数据一致性

### 数据库配置

```typescript
// database/config.ts

export const DB_CONFIG = {
  name: 'healthora.db',
  version: 1,
  location: 'default',
}

// 数据库版本管理
export const SCHEMA_VERSIONS = [
  {
    version: 1,
    description: '初始版本',
    migrations: ['create_tables_v1'],
  },
  // 未来版本在这里添加
]
```

---

## 📋 表结构设计

### 1. 饮食记录表 (diet_records)

#### 表结构

```sql
CREATE TABLE IF NOT EXISTS diet_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  photo_uri TEXT,
  foods_json TEXT,
  total_calories REAL,
  total_protein REAL,
  total_carbs REAL,
  total_fat REAL,
  meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  note TEXT,
  is_edited INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

#### 字段说明

| 字段           | 类型    | 必填 | 说明                    |
| -------------- | ------- | ---- | ----------------------- |
| id             | INTEGER | 是   | 主键，自增              |
| timestamp      | TEXT    | 是   | 记录时间，ISO 8601 格式 |
| photo_uri      | TEXT    | 否   | 照片本地存储路径        |
| foods_json     | TEXT    | 否   | 食物列表 JSON 字符串    |
| total_calories | REAL    | 否   | 总卡路里（kcal）        |
| total_protein  | REAL    | 否   | 总蛋白质（g）           |
| total_carbs    | REAL    | 否   | 总碳水化合物（g）       |
| total_fat      | REAL    | 否   | 总脂肪（g）             |
| meal_type      | TEXT    | 否   | 餐次类型                |
| note           | TEXT    | 否   | 用户备注                |
| is_edited      | INTEGER | 否   | 是否手动编辑过（0/1）   |
| created_at     | TEXT    | 否   | 创建时间                |
| updated_at     | TEXT    | 否   | 更新时间                |

#### foods_json 结构

```json
[
  {
    "name": "食物名称",
    "portion": "份量描述",
    "calories": 150,
    "protein": 20,
    "carbs": 15,
    "fat": 5
  }
]
```

#### 索引

```sql
-- 按时间查询优化
CREATE INDEX IF NOT EXISTS idx_diet_timestamp ON diet_records(timestamp);

-- 按日期查询优化（用于日历视图）
CREATE INDEX IF NOT EXISTS idx_diet_date ON diet_records(date(timestamp));

-- 按餐次查询优化
CREATE INDEX IF NOT EXISTS idx_diet_meal_type ON diet_records(meal_type);
```

#### 触发器

```sql
-- 自动更新 updated_at
CREATE TRIGGER IF NOT EXISTS diet_records_update
AFTER UPDATE ON diet_records
BEGIN
  UPDATE diet_records SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
END;
```

---

### 2. 运动记录表 (exercise_records)

#### 表结构

```sql
CREATE TABLE IF NOT EXISTS exercise_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned REAL,
  distance_km REAL,
  heart_rate_avg INTEGER,
  source TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'screenshot', 'health_connect')),
  screenshot_uri TEXT,
  raw_data TEXT,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

#### 字段说明

| 字段             | 类型    | 必填 | 说明              |
| ---------------- | ------- | ---- | ----------------- |
| id               | INTEGER | 是   | 主键，自增        |
| timestamp        | TEXT    | 是   | 运动时间          |
| exercise_type    | TEXT    | 是   | 运动类型          |
| duration_minutes | INTEGER | 是   | 运动时长（分钟）  |
| calories_burned  | REAL    | 否   | 消耗卡路里        |
| distance_km      | REAL    | 否   | 运动距离（公里）  |
| heart_rate_avg   | INTEGER | 否   | 平均心率          |
| source           | TEXT    | 否   | 数据来源          |
| screenshot_uri   | TEXT    | 否   | 截图路径          |
| raw_data         | TEXT    | 否   | 原始同步数据 JSON |
| note             | TEXT    | 否   | 备注              |
| created_at       | TEXT    | 否   | 创建时间          |
| updated_at       | TEXT    | 否   | 更新时间          |

#### exercise_type 枚举值

```typescript
export const EXERCISE_TYPES = {
  running: '跑步',
  walking: '步行',
  cycling: '骑行',
  swimming: '游泳',
  strength: '力量训练',
  yoga: '瑜伽',
  hiit: 'HIIT',
  other: '其他',
} as const
```

#### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_exercise_timestamp ON exercise_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_exercise_date ON exercise_records(date(timestamp));
CREATE INDEX IF NOT EXISTS idx_exercise_type ON exercise_records(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercise_source ON exercise_records(source);
```

#### 触发器

```sql
CREATE TRIGGER IF NOT EXISTS exercise_records_update
AFTER UPDATE ON exercise_records
BEGIN
  UPDATE exercise_records SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
END;
```

---

### 3. 体重记录表 (weight_records)

#### 表结构

```sql
CREATE TABLE IF NOT EXISTS weight_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  weight REAL NOT NULL,
  body_fat_percentage REAL,
  muscle_mass REAL,
  source TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'health_connect')),
  note TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

#### 字段说明

| 字段                | 类型    | 必填 | 说明                   |
| ------------------- | ------- | ---- | ---------------------- |
| id                  | INTEGER | 是   | 主键，自增             |
| timestamp           | TEXT    | 是   | 记录时间               |
| weight              | REAL    | 是   | 体重（kg），精确到 0.1 |
| body_fat_percentage | REAL    | 否   | 体脂率（%）            |
| muscle_mass         | REAL    | 否   | 肌肉量（kg）           |
| source              | TEXT    | 否   | 数据来源               |
| note                | TEXT    | 否   | 备注                   |
| created_at          | TEXT    | 否   | 创建时间               |

#### 约束

```sql
-- 体重合理范围检查（20kg - 300kg）
CREATE TABLE IF NOT EXISTS weight_records (
  -- ... 其他字段
  CONSTRAINT weight_range CHECK(weight >= 20 AND weight <= 300)
);

-- 体脂率合理范围检查（3% - 60%）
  CONSTRAINT body_fat_range CHECK(body_fat_percentage >= 3 AND body_fat_percentage <= 60)
);
```

#### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_weight_timestamp ON weight_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_records(date(timestamp));
```

---

### 4. 目标设置表 (goals)

#### 表结构

```sql
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_type TEXT NOT NULL,
  target_value REAL NOT NULL,
  start_value REAL,
  start_date TEXT,
  target_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

#### 字段说明

| 字段         | 类型    | 必填 | 说明            |
| ------------ | ------- | ---- | --------------- |
| id           | INTEGER | 是   | 主键，自增      |
| goal_type    | TEXT    | 是   | 目标类型        |
| target_value | REAL    | 是   | 目标值          |
| start_value  | REAL    | 否   | 起始值          |
| start_date   | TEXT    | 否   | 开始日期        |
| target_date  | TEXT    | 否   | 目标日期        |
| is_active    | INTEGER | 否   | 是否激活（0/1） |
| created_at   | TEXT    | 否   | 创建时间        |
| updated_at   | TEXT    | 否   | 更新时间        |

#### goal_type 枚举值

```typescript
export const GOAL_TYPES = {
  target_weight: '目标体重',
  daily_calories: '每日卡路里目标',
  weekly_exercise: '每周运动次数',
  exercise_duration: '每次运动时长',
} as const
```

#### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(is_active);
```

---

### 5. AI 配置表 (ai_config)

#### 表结构

```sql
CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model_name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

#### 字段说明

| 字段         | 类型    | 必填 | 说明                |
| ------------ | ------- | ---- | ------------------- |
| id           | INTEGER | 是   | 主键，自增          |
| api_endpoint | TEXT    | 是   | API 地址            |
| api_key      | TEXT    | 是   | API Key（加密存储） |
| model_name   | TEXT    | 是   | 模型名称            |
| is_active    | INTEGER | 否   | 是否激活（0/1）     |
| created_at   | TEXT    | 否   | 创建时间            |
| updated_at   | TEXT    | 否   | 更新时间            |

#### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_ai_config_active ON ai_config(is_active);
```

---

### 6. 同步记录表 (sync_log)

#### 表结构

```sql
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_type TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id INTEGER,
  external_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  error_message TEXT,
  synced_at TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

#### 字段说明

| 字段          | 类型    | 必填 | 说明                             |
| ------------- | ------- | ---- | -------------------------------- |
| id            | INTEGER | 是   | 主键，自增                       |
| sync_type     | TEXT    | 是   | 同步类型（import/export）        |
| record_type   | TEXT    | 是   | 记录类型（diet/exercise/weight） |
| record_id     | INTEGER | 否   | 本地记录 ID                      |
| external_id   | TEXT    | 否   | 外部系统 ID                      |
| sync_status   | TEXT    | 否   | 同步状态                         |
| error_message | TEXT    | 否   | 错误信息                         |
| synced_at     | TEXT    | 否   | 同步时间                         |
| created_at    | TEXT    | 否   | 创建时间                         |

#### sync_status 枚举值

```typescript
export const SYNC_STATUS = {
  pending: '待同步',
  syncing: '同步中',
  success: '同步成功',
  failed: '同步失败',
} as const
```

#### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_log_record ON sync_log(record_type, record_id);
```

---

## 🔍 查询设计

### 饮食记录查询

```typescript
// database/queries/diet.ts

import { database } from '../index'
import { DietRecord } from '@/types/diet'

export const dietQueries = {
  // 获取指定日期的记录
  async getByDate(date: string): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT * FROM diet_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [date]
    )
  },

  // 获取日期范围内的记录
  async getByDateRange(startDate: string, endDate: string): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT * FROM diet_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate]
    )
  },

  // 获取最近 N 条记录
  async getRecent(limit: number = 10): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT * FROM diet_records
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    )
  },

  // 获取今日记录
  async getToday(): Promise<DietRecord[]> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    return db.getAllAsync<DietRecord>(
      `SELECT * FROM diet_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [today]
    )
  },

  // 获取今日总卡路里
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

  // 获取今日营养成分汇总
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

  // 获取按日期分组的卡路里统计
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

  // 获取按餐次统计
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

  // 插入记录
  async insert(record: Omit<DietRecord, 'id'>): Promise<number> {
    const db = database.getDatabase()
    const result = await db.runAsync(
      `INSERT INTO diet_records (
        timestamp, photo_uri, foods_json, total_calories,
        total_protein, total_carbs, total_fat, meal_type,
        note, is_edited
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.timestamp,
        record.photoUri,
        record.foodsJson,
        record.totalCalories,
        record.totalProtein,
        record.totalCarbs,
        record.totalFat,
        record.mealType,
        record.note,
        record.isEdited ? 1 : 0,
      ]
    )
    return result.lastInsertRowId
  },

  // 更新记录
  async update(id: number, updates: Partial<DietRecord>): Promise<void> {
    const db = database.getDatabase()
    const setClauses: string[] = []
    const params: any[] = []

    if (updates.timestamp !== undefined) {
      setClauses.push('timestamp = ?')
      params.push(updates.timestamp)
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

  // 删除记录
  async delete(id: number): Promise<void> {
    const db = database.getDatabase()
    await db.runAsync('DELETE FROM diet_records WHERE id = ?', [id])
  },

  // 获取记录数量
  async getCount(): Promise<number> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM diet_records'
    )
    return result?.count || 0
  },

  // 搜索记录（按食物名称）
  async search(keyword: string): Promise<DietRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<DietRecord>(
      `SELECT * FROM diet_records
       WHERE foods_json LIKE ?
       ORDER BY timestamp DESC`,
      [`%${keyword}%`]
    )
  },
}
```

### 运动记录查询

```typescript
// database/queries/exercise.ts

import { database } from '../index'
import { ExerciseRecord } from '@/types/exercise'

export const exerciseQueries = {
  // 获取指定日期的记录
  async getByDate(date: string): Promise<ExerciseRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<ExerciseRecord>(
      `SELECT * FROM exercise_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [date]
    )
  },

  // 获取日期范围内的记录
  async getByDateRange(startDate: string, endDate: string): Promise<ExerciseRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<ExerciseRecord>(
      `SELECT * FROM exercise_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate]
    )
  },

  // 获取今日记录
  async getToday(): Promise<ExerciseRecord[]> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    return db.getAllAsync<ExerciseRecord>(
      `SELECT * FROM exercise_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp ASC`,
      [today]
    )
  },

  // 获取今日总运动时长（分钟）
  async getTodayDuration(): Promise<number> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total
       FROM exercise_records
       WHERE date(timestamp) = ?`,
      [today]
    )
    return result?.total || 0
  },

  // 获取今日总消耗卡路里
  async getTodayCalories(): Promise<number> {
    const db = database.getDatabase()
    const today = new Date().toISOString().split('T')[0]
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(calories_burned), 0) as total
       FROM exercise_records
       WHERE date(timestamp) = ?`,
      [today]
    )
    return result?.total || 0
  },

  // 获取按日期分组的运动统计
  async getDailyStats(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; duration: number; calories: number }[]> {
    const db = database.getDatabase()
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
    )
  },

  // 获取按运动类型统计
  async getTypeStats(
    startDate: string,
    endDate: string
  ): Promise<{ exercise_type: string; count: number; total_duration: number }[]> {
    const db = database.getDatabase()
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
    )
  },

  // 插入记录
  async insert(record: Omit<ExerciseRecord, 'id'>): Promise<number> {
    const db = database.getDatabase()
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
        record.caloriesBurned,
        record.distanceKm,
        record.heartRateAvg,
        record.source,
        record.screenshotUri,
        record.rawData,
        record.note,
      ]
    )
    return result.lastInsertRowId
  },

  // 更新记录
  async update(id: number, updates: Partial<ExerciseRecord>): Promise<void> {
    const db = database.getDatabase()
    const setClauses: string[] = []
    const params: any[] = []

    if (updates.timestamp !== undefined) {
      setClauses.push('timestamp = ?')
      params.push(updates.timestamp)
    }
    if (updates.exerciseType !== undefined) {
      setClauses.push('exercise_type = ?')
      params.push(updates.exerciseType)
    }
    if (updates.durationMinutes !== undefined) {
      setClauses.push('duration_minutes = ?')
      params.push(updates.durationMinutes)
    }
    if (updates.caloriesBurned !== undefined) {
      setClauses.push('calories_burned = ?')
      params.push(updates.caloriesBurned)
    }
    if (updates.distanceKm !== undefined) {
      setClauses.push('distance_km = ?')
      params.push(updates.distanceKm)
    }
    if (updates.note !== undefined) {
      setClauses.push('note = ?')
      params.push(updates.note)
    }

    if (setClauses.length === 0) return

    params.push(id)
    await db.runAsync(`UPDATE exercise_records SET ${setClauses.join(', ')} WHERE id = ?`, params)
  },

  // 删除记录
  async delete(id: number): Promise<void> {
    const db = database.getDatabase()
    await db.runAsync('DELETE FROM exercise_records WHERE id = ?', [id])
  },

  // 获取记录数量
  async getCount(): Promise<number> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercise_records'
    )
    return result?.count || 0
  },
}
```

### 体重记录查询

```typescript
// database/queries/weight.ts

import { database } from '../index'
import { WeightRecord } from '@/types/weight'

export const weightQueries = {
  // 获取最新记录
  async getLatest(): Promise<WeightRecord | null> {
    const db = database.getDatabase()
    return db.getFirstAsync<WeightRecord>(
      `SELECT * FROM weight_records
       ORDER BY timestamp DESC
       LIMIT 1`
    )
  },

  // 获取指定日期的记录
  async getByDate(date: string): Promise<WeightRecord | null> {
    const db = database.getDatabase()
    return db.getFirstAsync<WeightRecord>(
      `SELECT * FROM weight_records
       WHERE date(timestamp) = ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [date]
    )
  },

  // 获取日期范围内的记录
  async getByDateRange(startDate: string, endDate: string): Promise<WeightRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<WeightRecord>(
      `SELECT * FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [startDate, endDate]
    )
  },

  // 获取最近 N 条记录
  async getRecent(limit: number = 30): Promise<WeightRecord[]> {
    const db = database.getDatabase()
    return db.getAllAsync<WeightRecord>(
      `SELECT * FROM weight_records
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    )
  },

  // 获取体重统计
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
    const result = await db.getFirstAsync(
      `SELECT
        MIN(weight) as min,
        MAX(weight) as max,
        AVG(weight) as avg
       FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?`,
      [startDate, endDate]
    )

    if (!result || !result.min) return null

    const first = await db.getFirstAsync<{ weight: number }>(
      `SELECT weight FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp ASC
       LIMIT 1`,
      [startDate, endDate]
    )

    const last = await db.getFirstAsync<{ weight: number }>(
      `SELECT weight FROM weight_records
       WHERE date(timestamp) BETWEEN ? AND ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [startDate, endDate]
    )

    return {
      min: result.min,
      max: result.max,
      avg: Math.round(result.avg * 10) / 10,
      first: first?.weight || 0,
      last: last?.weight || 0,
      change: last && first ? Math.round((last.weight - first.weight) * 10) / 10 : 0,
    }
  },

  // 获取每日体重（用于趋势图）
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

  // 插入记录
  async insert(record: Omit<WeightRecord, 'id'>): Promise<number> {
    const db = database.getDatabase()
    const result = await db.runAsync(
      `INSERT INTO weight_records (
        timestamp, weight, body_fat_percentage, muscle_mass,
        source, note
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        record.timestamp,
        record.weight,
        record.bodyFatPercentage,
        record.muscleMass,
        record.source,
        record.note,
      ]
    )
    return result.lastInsertRowId
  },

  // 删除记录
  async delete(id: number): Promise<void> {
    const db = database.getDatabase()
    await db.runAsync('DELETE FROM weight_records WHERE id = ?', [id])
  },

  // 获取记录数量
  async getCount(): Promise<number> {
    const db = database.getDatabase()
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM weight_records'
    )
    return result?.count || 0
  },
}
```

### 目标查询

```typescript
// database/queries/goals.ts

import { database } from '../index'
import { Goal } from '@/types/goal'

export const goalQueries = {
  // 获取激活的目标
  async getActive(type?: string): Promise<Goal | null> {
    const db = database.getDatabase()
    let query = `SELECT * FROM goals WHERE is_active = 1`
    const params: any[] = []

    if (type) {
      query += ` AND goal_type = ?`
      params.push(type)
    }

    query += ` ORDER BY created_at DESC LIMIT 1`
    return db.getFirstAsync<Goal>(query, params)
  },

  // 获取所有目标
  async getAll(): Promise<Goal[]> {
    const db = database.getDatabase()
    return db.getAllAsync<Goal>(`SELECT * FROM goals ORDER BY created_at DESC`)
  },

  // 设置目标
  async set(goal: Omit<Goal, 'id'>): Promise<number> {
    const db = database.getDatabase()

    // 先将同类型的目标设为非激活
    await db.runAsync(`UPDATE goals SET is_active = 0 WHERE goal_type = ?`, [goal.goalType])

    // 插入新目标
    const result = await db.runAsync(
      `INSERT INTO goals (
        goal_type, target_value, start_value,
        start_date, target_date, is_active
      ) VALUES (?, ?, ?, ?, ?, 1)`,
      [goal.goalType, goal.targetValue, goal.startValue, goal.startDate, goal.targetDate]
    )
    return result.lastInsertRowId
  },

  // 更新目标
  async update(id: number, updates: Partial<Goal>): Promise<void> {
    const db = database.getDatabase()
    const setClauses: string[] = []
    const params: any[] = []

    if (updates.targetValue !== undefined) {
      setClauses.push('target_value = ?')
      params.push(updates.targetValue)
    }
    if (updates.targetDate !== undefined) {
      setClauses.push('target_date = ?')
      params.push(updates.targetDate)
    }
    if (updates.isActive !== undefined) {
      setClauses.push('is_active = ?')
      params.push(updates.isActive ? 1 : 0)
    }

    if (setClauses.length === 0) return

    params.push(id)
    await db.runAsync(`UPDATE goals SET ${setClauses.join(', ')} WHERE id = ?`, params)
  },

  // 删除目标
  async delete(id: number): Promise<void> {
    const db = database.getDatabase()
    await db.runAsync('DELETE FROM goals WHERE id = ?', [id])
  },
}
```

### AI 配置查询

```typescript
// database/queries/aiConfig.ts

import { database } from '../index'
import { AIConfig } from '@/types/ai'

export const aiConfigQueries = {
  // 获取激活的配置
  async getActive(): Promise<AIConfig | null> {
    const db = database.getDatabase()
    return db.getFirstAsync<AIConfig>(
      `SELECT * FROM ai_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1`
    )
  },

  // 保存配置
  async save(config: Omit<AIConfig, 'id'>): Promise<number> {
    const db = database.getDatabase()

    // 先将所有配置设为非激活
    await db.runAsync(`UPDATE ai_config SET is_active = 0`)

    // 插入新配置
    const result = await db.runAsync(
      `INSERT INTO ai_config (api_endpoint, api_key, model_name, is_active)
       VALUES (?, ?, ?, 1)`,
      [config.apiEndpoint, config.apiKey, config.modelName]
    )
    return result.lastInsertRowId
  },

  // 更新配置
  async update(id: number, updates: Partial<AIConfig>): Promise<void> {
    const db = database.getDatabase()
    const setClauses: string[] = []
    const params: any[] = []

    if (updates.apiEndpoint !== undefined) {
      setClauses.push('api_endpoint = ?')
      params.push(updates.apiEndpoint)
    }
    if (updates.apiKey !== undefined) {
      setClauses.push('api_key = ?')
      params.push(updates.apiKey)
    }
    if (updates.modelName !== undefined) {
      setClauses.push('model_name = ?')
      params.push(updates.modelName)
    }

    if (setClauses.length === 0) return

    params.push(id)
    await db.runAsync(`UPDATE ai_config SET ${setClauses.join(', ')} WHERE id = ?`, params)
  },
}
```

---

## 🔄 数据库迁移

### 迁移机制

```typescript
// database/migrations.ts

import { database } from './index'

interface Migration {
  version: number
  description: string
  up: (db: any) => Promise<void>
}

const migrations: Migration[] = [
  {
    version: 1,
    description: '创建初始表结构',
    up: async (db) => {
      // 创建饮食记录表
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS diet_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          photo_uri TEXT,
          foods_json TEXT,
          total_calories REAL,
          total_protein REAL,
          total_carbs REAL,
          total_fat REAL,
          meal_type TEXT,
          note TEXT,
          is_edited INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `)

      // 创建运动记录表
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS exercise_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          exercise_type TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL,
          calories_burned REAL,
          distance_km REAL,
          heart_rate_avg INTEGER,
          source TEXT DEFAULT 'manual',
          screenshot_uri TEXT,
          raw_data TEXT,
          note TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `)

      // 创建体重记录表
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS weight_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          weight REAL NOT NULL,
          body_fat_percentage REAL,
          muscle_mass REAL,
          source TEXT DEFAULT 'manual',
          note TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `)

      // 创建目标表
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_type TEXT NOT NULL,
          target_value REAL NOT NULL,
          start_value REAL,
          start_date TEXT,
          target_date TEXT,
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `)

      // 创建 AI 配置表
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ai_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          api_endpoint TEXT NOT NULL,
          api_key TEXT NOT NULL,
          model_name TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `)

      // 创建同步日志表
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sync_type TEXT NOT NULL,
          record_type TEXT NOT NULL,
          record_id INTEGER,
          external_id TEXT,
          sync_status TEXT DEFAULT 'pending',
          error_message TEXT,
          synced_at TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `)

      // 创建索引
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_diet_timestamp ON diet_records(timestamp);
        CREATE INDEX IF NOT EXISTS idx_diet_date ON diet_records(date(timestamp));
        CREATE INDEX IF NOT EXISTS idx_diet_meal_type ON diet_records(meal_type);
        CREATE INDEX IF NOT EXISTS idx_exercise_timestamp ON exercise_records(timestamp);
        CREATE INDEX IF NOT EXISTS idx_exercise_date ON exercise_records(date(timestamp));
        CREATE INDEX IF NOT EXISTS idx_exercise_type ON exercise_records(exercise_type);
        CREATE INDEX IF NOT EXISTS idx_weight_timestamp ON weight_records(timestamp);
        CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_records(date(timestamp));
        CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
        CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(is_active);
        CREATE INDEX IF NOT EXISTS idx_ai_config_active ON ai_config(is_active);
        CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
        CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(sync_status);
      `)
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
]

export async function runMigrations(): Promise<void> {
  const db = database.getDatabase()

  // 创建迁移版本表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      description TEXT,
      applied_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `)

  // 获取当前版本
  const currentVersion = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_version'
  )
  const current = currentVersion?.version || 0

  // 执行未执行的迁移
  for (const migration of migrations) {
    if (migration.version > current) {
      console.log(`执行迁移 v${migration.version}: ${migration.description}`)
      await migration.up(db)
      await db.runAsync('INSERT INTO schema_version (version, description) VALUES (?, ?)', [
        migration.version,
        migration.description,
      ])
    }
  }
}
```

---

## 📦 数据导入导出

### 导出格式

```typescript
// services/export/exporter.ts

import { database } from '@/database'
import { dietQueries, exerciseQueries, weightQueries, goalQueries } from '@/database/queries'

interface ExportData {
  version: string
  exportedAt: string
  app: {
    name: string
    version: string
  }
  data: {
    dietRecords: any[]
    exerciseRecords: any[]
    weightRecords: any[]
    goals: any[]
  }
}

export async function exportToJSON(): Promise<string> {
  // 获取所有数据
  const dietRecords = await dietQueries.getByDateRange('2000-01-01', '2099-12-31')
  const exerciseRecords = await exerciseQueries.getByDateRange('2000-01-01', '2099-12-31')
  const weightRecords = await weightQueries.getByDateRange('2000-01-01', '2099-12-31')
  const goals = await goalQueries.getAll()

  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    app: {
      name: 'Healthora Fit',
      version: '1.0.0',
    },
    data: {
      dietRecords,
      exerciseRecords,
      weightRecords,
      goals,
    },
  }

  return JSON.stringify(exportData, null, 2)
}
```

### 导入逻辑

```typescript
// services/export/importer.ts

import { database } from '@/database'
import { dietQueries, exerciseQueries, weightQueries, goalQueries } from '@/database/queries'

interface ImportResult {
  success: boolean
  imported: {
    dietRecords: number
    exerciseRecords: number
    weightRecords: number
    goals: number
  }
  skipped: number
  errors: string[]
}

export async function importFromJSON(json: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: {
      dietRecords: 0,
      exerciseRecords: 0,
      weightRecords: 0,
      goals: 0,
    },
    skipped: 0,
    errors: [],
  }

  try {
    const data = JSON.parse(json)

    // 验证数据格式
    if (!data.version || !data.data) {
      throw new Error('无效的导出文件格式')
    }

    // 导入饮食记录
    for (const record of data.data.dietRecords || []) {
      try {
        await dietQueries.insert(record)
        result.imported.dietRecords++
      } catch (error) {
        result.errors.push(`导入饮食记录失败: ${error.message}`)
        result.skipped++
      }
    }

    // 导入运动记录
    for (const record of data.data.exerciseRecords || []) {
      try {
        await exerciseQueries.insert(record)
        result.imported.exerciseRecords++
      } catch (error) {
        result.errors.push(`导入运动记录失败: ${error.message}`)
        result.skipped++
      }
    }

    // 导入体重记录
    for (const record of data.data.weightRecords || []) {
      try {
        await weightQueries.insert(record)
        result.imported.weightRecords++
      } catch (error) {
        result.errors.push(`导入体重记录失败: ${error.message}`)
        result.skipped++
      }
    }

    // 导入目标
    for (const goal of data.data.goals || []) {
      try {
        await goalQueries.set(goal)
        result.imported.goals++
      } catch (error) {
        result.errors.push(`导入目标失败: ${error.message}`)
        result.skipped++
      }
    }

    if (result.errors.length > 0) {
      result.success = false
    }
  } catch (error) {
    result.success = false
    result.errors.push(`解析文件失败: ${error.message}`)
  }

  return result
}
```

---

## 🧹 数据清理策略

### 自动清理

```typescript
// database/cleanup.ts

export const cleanupQueries = {
  // 清理超过指定天数的照片
  async cleanupOldPhotos(days: number = 90): Promise<number> {
    const db = database.getDatabase()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffStr = cutoffDate.toISOString()

    // 获取要删除的照片路径
    const records = await db.getAllAsync<{ photo_uri: string }>(
      `SELECT photo_uri FROM diet_records
       WHERE timestamp < ? AND photo_uri IS NOT NULL`,
      [cutoffStr]
    )

    // 删除照片文件
    for (const record of records) {
      try {
        await FileSystem.deleteAsync(record.photo_uri)
      } catch (error) {
        // 忽略文件不存在的错误
      }
    }

    return records.length
  },

  // 清理同步日志
  async cleanupSyncLogs(days: number = 30): Promise<number> {
    const db = database.getDatabase()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffStr = cutoffDate.toISOString()

    const result = await db.runAsync(`DELETE FROM sync_log WHERE created_at < ?`, [cutoffStr])

    return result.changes
  },
}
```

### 存储空间管理

```typescript
// utils/storage.ts

export async function getStorageUsage(): Promise<{
  database: number
  images: number
  total: number
}> {
  const dbPath = `${FileSystem.documentDirectory}SQLite/healthora.db`
  const imagesPath = `${FileSystem.documentDirectory}images/`

  let dbSize = 0
  let imagesSize = 0

  try {
    const dbInfo = await FileSystem.getInfoAsync(dbPath)
    if (dbInfo.exists) {
      dbSize = dbInfo.size
    }
  } catch (error) {
    // 忽略
  }

  try {
    const imagesInfo = await FileSystem.getInfoAsync(imagesPath)
    if (imagesInfo.exists) {
      // 遍历图片目录计算大小
      // ...
    }
  } catch (error) {
    // 忽略
  }

  return {
    database: dbSize,
    images: imagesSize,
    total: dbSize + imagesSize,
  }
}
```

---

## 📊 数据库性能优化

### 查询优化建议

1. **使用索引**：为常用查询字段创建索引
2. **分页查询**：大数据集使用 LIMIT 和 OFFSET
3. **批量操作**：使用事务处理批量插入/更新
4. **避免 SELECT \***：只查询需要的字段

### 事务处理

```typescript
// 使用事务批量插入
async function batchInsert(records: any[]): Promise<void> {
  const db = database.getDatabase();

  await db.execAsync('BEGIN TRANSACTION');

  try {
    for (const record of records) {
      await db.runAsync(
        'INSERT INTO diet_records (...) VALUES (...)',
        [...]
      );
    }
    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}
```

### 数据库大小监控

```typescript
export async function getDatabaseSize(): Promise<number> {
  const dbPath = `${FileSystem.documentDirectory}SQLite/healthora.db`
  const info = await FileSystem.getInfoAsync(dbPath)
  return info.exists ? info.size : 0
}
```

---

_文档版本：v1.0_
_最后更新：2026-06-03_
