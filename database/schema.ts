// database/schema.ts
// 数据库表结构定义

/**
 * 数据库版本
 */
export const DB_VERSION = 1;

/**
 * 创建表的 SQL 语句
 */
export const CREATE_TABLES_SQL = `
-- 饮食记录表
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

-- 运动记录表
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

-- 体重记录表
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

-- 目标设置表
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

-- AI 配置表
CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model_name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 同步日志表
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
`;

/**
 * 创建索引的 SQL 语句
 */
export const CREATE_INDEXES_SQL = `
-- 饮食记录索引
CREATE INDEX IF NOT EXISTS idx_diet_timestamp ON diet_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_diet_date ON diet_records(date(timestamp));
CREATE INDEX IF NOT EXISTS idx_diet_meal_type ON diet_records(meal_type);

-- 运动记录索引
CREATE INDEX IF NOT EXISTS idx_exercise_timestamp ON exercise_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_exercise_date ON exercise_records(date(timestamp));
CREATE INDEX IF NOT EXISTS idx_exercise_type ON exercise_records(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercise_source ON exercise_records(source);

-- 体重记录索引
CREATE INDEX IF NOT EXISTS idx_weight_timestamp ON weight_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_records(date(timestamp));

-- 目标索引
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(is_active);

-- AI 配置索引
CREATE INDEX IF NOT EXISTS idx_ai_config_active ON ai_config(is_active);

-- 同步日志索引
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_log_record ON sync_log(record_type, record_id);
`;

/**
 * 创建触发器的 SQL 语句
 */
export const CREATE_TRIGGERS_SQL = `
-- 饮食记录更新触发器
CREATE TRIGGER IF NOT EXISTS diet_records_update
AFTER UPDATE ON diet_records
BEGIN
  UPDATE diet_records SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
END;

-- 运动记录更新触发器
CREATE TRIGGER IF NOT EXISTS exercise_records_update
AFTER UPDATE ON exercise_records
BEGIN
  UPDATE exercise_records SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
END;

-- 目标更新触发器
CREATE TRIGGER IF NOT EXISTS goals_update
AFTER UPDATE ON goals
BEGIN
  UPDATE goals SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
END;

-- AI 配置更新触发器
CREATE TRIGGER IF NOT EXISTS ai_config_update
AFTER UPDATE ON ai_config
BEGIN
  UPDATE ai_config SET updated_at = datetime('now', 'localtime') WHERE id = NEW.id;
END;
`;

/**
 * 数据库迁移版本表
 */
export const CREATE_MIGRATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  description TEXT,
  applied_at TEXT DEFAULT (datetime('now', 'localtime'))
);
`;
