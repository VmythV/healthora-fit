# Healthora Fit — 技术架构设计文档 v1.0

> **技术栈**：React Native + Expo + TypeScript
> **架构模式**：分层架构 + 状态管理
> **最后更新**：2026-06-03

---

## 🏗️ 整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         展示层 (Presentation)                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Pages / Screens                                            │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│ │
│  │  │  首页   │ │  日历   │ │  快记   │ │  分析   │ │  设置  ││ │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘│ │
│  └───────┼──────────┼──────────┼──────────┼────────────┼─────┘ │
│          │          │          │          │            │        │
│  ┌───────┴──────────┴──────────┴──────────┴────────────┴─────┐ │
│  │  Components (UI 组件库)                                    │ │
│  │  Button, Input, Card, Modal, Chart, Icon...               │ │
│  └────────────────────────────┬──────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                         状态层 (State)                           │
│  ┌────────────────────────────┴──────────────────────────────┐ │
│  │  Zustand Stores                                            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │  │ appStore │ │dietStore │ │exercise  │ │weightStore│     │ │
│  │  │          │ │          │ │  Store   │ │          │     │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │ │
│  └────────────────────────────┬──────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                         服务层 (Service)                         │
│  ┌────────────────────────────┴──────────────────────────────┐ │
│  │  Services                                                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │  │ AI Service│ │Health   │ │Export   │ │Image    │     │ │
│  │  │          │ │Service  │ │Service  │ │Service  │     │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │ │
│  └────────────────────────────┬──────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                         数据层 (Data)                            │
│  ┌────────────────────────────┴──────────────────────────────┐ │
│  │  Database & Storage                                         │ │
│  │  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │  │   SQLite         │  │   File System    │               │ │
│  │  │   (结构化数据)    │  │   (图片/文件)    │               │ │
│  │  └──────────────────┘  └──────────────────┘               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                         外部层 (External)                        │
│  ┌────────────────────────────┴──────────────────────────────┐ │
│  │  External APIs & Platforms                                  │ │
│  │  ┌──────────┐ ┌──────────────────┐ ┌──────────────────┐   │ │
│  │  │ AI API   │ │ Health Connect   │ │ HealthKit        │   │ │
│  │  │(OpenAI)  │ │ (Android)        │ │ (iOS)            │   │ │
│  │  └──────────┘ └──────────────────┘ └──────────────────┘   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 分层职责

| 层级 | 职责 | 主要技术 |
|------|------|---------|
| 展示层 | UI 渲染、用户交互 | React Native Components |
| 状态层 | 状态管理、数据缓存 | Zustand |
| 服务层 | 业务逻辑、外部调用 | TypeScript Services |
| 数据层 | 数据持久化 | SQLite, File System |
| 外部层 | 第三方服务集成 | REST API, SDK |

---

## 📁 项目目录结构

```
healthora-fit/
│
├── app/                              # Expo Router 页面
│   ├── _layout.tsx                   # 根布局
│   ├── (tabs)/                       # Tab 导航组
│   │   ├── _layout.tsx               # Tab 布局配置
│   │   ├── index.tsx                 # 首页
│   │   ├── calendar.tsx              # 日历
│   │   ├── record.tsx                # 快记（入口）
│   │   ├── analysis.tsx              # 分析
│   │   └── settings.tsx              # 设置
│   │
│   ├── diet/                         # 饮食相关页面
│   │   ├── record.tsx                # 记录饮食页
│   │   └── [id].tsx                  # 饮食记录详情页
│   │
│   ├── exercise/                     # 运动相关页面
│   │   ├── record.tsx                # 记录运动页
│   │   └── [id].tsx                  # 运动记录详情页
│   │
│   ├── weight/                       # 体重相关页面
│   │   └── record.tsx                # 记录体重页
│   │
│   └── settings/                     # 设置子页面
│       ├── ai-config.tsx             # AI 配置页
│       ├── health-connect.tsx        # 健康连接页
│       └── data-manage.tsx           # 数据管理页
│
├── components/                       # 可复用组件
│   ├── ui/                           # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Loading.tsx
│   │   ├── Empty.tsx
│   │   ├── Tag.tsx
│   │   ├── Switch.tsx
│   │   └── index.ts                  # 统一导出
│   │
│   ├── icons/                        # 自定义图标组件
│   │   ├── Icon.tsx                  # 图标基础组件
│   │   ├── HomeIcon.tsx
│   │   ├── CalendarIcon.tsx
│   │   ├── AddIcon.tsx
│   │   ├── ChartIcon.tsx
│   │   ├── SettingsIcon.tsx
│   │   ├── FoodIcon.tsx
│   │   ├── ExerciseIcon.tsx
│   │   ├── WeightIcon.tsx
│   │   └── index.ts
│   │
│   ├── charts/                       # 图表组件
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   └── ProgressRing.tsx
│   │
│   ├── diet/                         # 饮食相关组件
│   │   ├── DietRecordCard.tsx
│   │   ├── DietRecordForm.tsx
│   │   ├── FoodItemList.tsx
│   │   ├── FoodItemEditor.tsx
│   │   ├── MealTypeSelector.tsx
│   │   └── NutritionSummary.tsx
│   │
│   ├── exercise/                     # 运动相关组件
│   │   ├── ExerciseRecordCard.tsx
│   │   ├── ExerciseRecordForm.tsx
│   │   ├── ExerciseTypeSelector.tsx
│   │   └── DurationInput.tsx
│   │
│   ├── weight/                       # 体重相关组件
│   │   ├── WeightRecordCard.tsx
│   │   ├── WeightInput.tsx
│   │   └── WeightTrend.tsx
│   │
│   ├── dashboard/                    # 首页组件
│   │   ├── StatusCard.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── QuickActions.tsx
│   │   └── TodayRecords.tsx
│   │
│   ├── calendar/                     # 日历组件
│   │   ├── MonthView.tsx
│   │   ├── DayView.tsx
│   │   ├── CalendarGrid.tsx
│   │   └── DateRecordCard.tsx
│   │
│   └── analysis/                     # 分析组件
│       ├── TimeRangeSelector.tsx
│       ├── WeightTrendChart.tsx
│       ├── DietTrendChart.tsx
│       └── ExerciseTrendChart.tsx
│
├── constants/                        # 常量定义
│   ├── colors.ts                     # 颜色常量
│   ├── fonts.ts                      # 字体常量
│   ├── spacing.ts                    # 间距常量
│   ├── exerciseTypes.ts              # 运动类型
│   ├── mealTypes.ts                  # 餐次类型
│   └── ai.ts                         # AI 相关常量
│
├── database/                         # 数据库层
│   ├── index.ts                      # 数据库初始化
│   ├── schema.ts                     # Schema 定义
│   ├── migrations.ts                 # 迁移脚本
│   └── queries/                      # 查询函数
│       ├── diet.ts
│       ├── exercise.ts
│       ├── weight.ts
│       ├── goals.ts
│       └── aiConfig.ts
│
├── hooks/                            # 自定义 Hooks
│   ├── useDatabase.ts                # 数据库 Hook
│   ├── useTheme.ts                   # 主题 Hook
│   ├── useAI.ts                      # AI 服务 Hook
│   ├── useHealthConnect.ts           # Health Connect Hook
│   ├── useDietRecords.ts
│   ├── useExerciseRecords.ts
│   └── useWeightRecords.ts
│
├── services/                         # 服务层
│   ├── ai/
│   │   ├── index.ts                  # AI 服务入口
│   │   ├── client.ts                 # API 客户端
│   │   ├── prompts.ts                # Prompt 模板
│   │   └── parsers.ts                # 响应解析
│   │
│   ├── health/
│   │   ├── index.ts                  # 健康服务入口
│   │   ├── healthConnect.ts          # Android Health Connect
│   │   └── healthKit.ts              # iOS HealthKit
│   │
│   ├── export/
│   │   ├── index.ts                  # 导入导出服务
│   │   ├── exporter.ts               # 导出逻辑
│   │   └── importer.ts               # 导入逻辑
│   │
│   └── image/
│       ├── index.ts                  # 图片服务
│       ├── camera.ts                 # 相机功能
│       └── storage.ts                # 图片存储
│
├── stores/                           # Zustand 状态管理
│   ├── appStore.ts                   # 应用全局状态
│   ├── dietStore.ts                  # 饮食记录状态
│   ├── exerciseStore.ts              # 运动记录状态
│   ├── weightStore.ts                # 体重记录状态
│   ├── goalStore.ts                  # 目标状态
│   └── aiStore.ts                    # AI 配置状态
│
├── types/                            # TypeScript 类型定义
│   ├── index.ts                      # 类型导出
│   ├── diet.ts                       # 饮食相关类型
│   ├── exercise.ts                   # 运动相关类型
│   ├── weight.ts                     # 体重相关类型
│   ├── goal.ts                       # 目标相关类型
│   ├── ai.ts                         # AI 相关类型
│   ├── health.ts                     # 健康平台类型
│   └── theme.ts                      # 主题类型
│
├── utils/                            # 工具函数
│   ├── date.ts                       # 日期处理
│   ├── format.ts                     # 格式化
│   ├── validation.ts                 # 数据验证
│   ├── calculation.ts                # 计算函数
│   ├── platform.ts                   # 平台判断
│   └── storage.ts                    # 本地存储
│
├── assets/                           # 静态资源
│   ├── icons/                        # SVG 图标文件
│   ├── images/                       # 图片资源
│   └── fonts/                        # 字体文件
│
├── app.json                          # Expo 配置
├── app.config.ts                     # Expo 动态配置
├── tsconfig.json                     # TypeScript 配置
├── package.json                      # 依赖管理
└── docs/                             # 项目文档
```

---

## 🔌 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                      依赖关系图                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  app/ (Pages)                                               │
│    │                                                        │
│    ├──→ components/                                         │
│    │      │                                                 │
│    │      ├──→ hooks/                                       │
│    │      │      │                                          │
│    │      │      ├──→ stores/                               │
│    │      │      │      │                                   │
│    │      │      │      ├──→ database/                      │
│    │      │      │      │      │                            │
│    │      │      │      │      └──→ types/                  │
│    │      │      │      │                                   │
│    │      │      │      └──→ services/                      │
│    │      │      │             │                            │
│    │      │      │             ├──→ types/                  │
│    │      │      │             └──→ utils/                  │
│    │      │      │                                          │
│    │      │      └──→ services/                             │
│    │      │                                                │
│    │      └──→ constants/                                   │
│    │                                                        │
│    └──→ types/                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 依赖规则

1. **单向依赖**：上层依赖下层，不允许反向依赖
2. **类型共享**：`types/` 被所有层依赖
3. **工具函数**：`utils/` 被所有层依赖
4. **常量**：`constants/` 被展示层和状态层依赖
5. **服务层**：不依赖展示层和状态层

---

## 📦 核心模块设计

### 1. 数据库模块 (database/)

```typescript
// database/index.ts
// 数据库初始化和管理

import * as SQLite from 'expo-sqlite';

class Database {
  private db: SQLite.SQLiteDatabase;

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('healthora.db');
    await this.runMigrations();
  }

  async runMigrations(): Promise<void> {
    // 执行数据库迁移
  }

  getDatabase(): SQLite.SQLiteDatabase {
    return this.db;
  }
}

export const database = new Database();
```

```typescript
// database/schema.ts
// Schema 定义

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
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
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercise_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    exercise_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned REAL,
    source TEXT DEFAULT 'manual',
    screenshot_uri TEXT,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weight_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    weight REAL NOT NULL,
    source TEXT DEFAULT 'manual',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_type TEXT NOT NULL,
    target_value REAL NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_endpoint TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_diet_timestamp ON diet_records(timestamp);
  CREATE INDEX IF NOT EXISTS idx_exercise_timestamp ON exercise_records(timestamp);
  CREATE INDEX IF NOT EXISTS idx_weight_timestamp ON weight_records(timestamp);
`;
```

### 2. 状态管理模块 (stores/)

```typescript
// stores/dietStore.ts
// 饮食记录状态管理

import { create } from 'zustand';
import { DietRecord, FoodItem } from '@/types/diet';
import { database } from '@/database';

interface DietState {
  // 状态
  records: DietRecord[];
  todayRecords: DietRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRecords: (date?: Date) => Promise<void>;
  loadTodayRecords: () => Promise<void>;
  addRecord: (record: Omit<DietRecord, 'id'>) => Promise<number>;
  updateRecord: (id: number, updates: Partial<DietRecord>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useDietStore = create<DietState>((set, get) => ({
  records: [],
  todayRecords: [],
  isLoading: false,
  error: null,

  loadRecords: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const db = database.getDatabase();
      let query = 'SELECT * FROM diet_records';
      let params: any[] = [];

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query += ' WHERE date(timestamp) = ?';
        params.push(dateStr);
      }

      query += ' ORDER BY timestamp DESC';

      const result = await db.getAllAsync(query, params);
      set({ records: result as DietRecord[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  loadTodayRecords: async () => {
    const today = new Date();
    await get().loadRecords(today);
    set({ todayRecords: get().records });
  },

  addRecord: async (record) => {
    set({ isLoading: true, error: null });
    try {
      const db = database.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO diet_records (timestamp, photo_uri, foods_json, total_calories, total_protein, total_carbs, total_fat, meal_type, note, is_edited)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      );
      set({ isLoading: false });
      return result.lastInsertRowId;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateRecord: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const db = database.getDatabase();
      const setClauses: string[] = [];
      const params: any[] = [];

      if (updates.timestamp !== undefined) {
        setClauses.push('timestamp = ?');
        params.push(updates.timestamp);
      }
      if (updates.foodsJson !== undefined) {
        setClauses.push('foods_json = ?');
        params.push(updates.foodsJson);
      }
      if (updates.totalCalories !== undefined) {
        setClauses.push('total_calories = ?');
        params.push(updates.totalCalories);
      }
      // ... 其他字段

      setClauses.push("updated_at = datetime('now')");
      params.push(id);

      await db.runAsync(
        `UPDATE diet_records SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );

      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const db = database.getDatabase();
      await db.runAsync('DELETE FROM diet_records WHERE id = ?', [id]);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### 3. AI 服务模块 (services/ai/)

```typescript
// services/ai/client.ts
// AI API 客户端

interface AIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AIClient {
  private config: AIConfig | null = null;

  setConfig(config: AIConfig): void {
    this.config = config;
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<AIResponse> {
    if (!this.config) {
      return { success: false, error: 'AI 配置未设置' };
    }

    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || '请求失败' };
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      // 解析 JSON 响应
      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async testConnection(): Promise<AIResponse> {
    if (!this.config) {
      return { success: false, error: 'AI 配置未设置' };
    }

    try {
      const response = await fetch(`${this.config.endpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return { success: false, error: '连接失败' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const aiClient = new AIClient();
```

```typescript
// services/ai/prompts.ts
// Prompt 模板

export const DIET_ANALYSIS_PROMPT = `你是一个专业的营养师和食物识别专家。请分析这张食物照片，识别其中的食物并估算营养成分。

请以 JSON 格式返回：
{
  "foods": [
    {
      "name": "食物名称",
      "portion": "估算份量（如 150g、1碗、1个）",
      "calories": 卡路里数值,
      "protein": 蛋白质克数,
      "carbs": 碳水化合物克数,
      "fat": 脂肪克数
    }
  ],
  "total": {
    "calories": 总卡路里,
    "protein": 总蛋白质,
    "carbs": 总碳水,
    "fat": 总脂肪
  },
  "meal_type": "根据时间推断的餐次：breakfast/lunch/dinner/snack",
  "confidence": "识别置信度：high/medium/low"
}

注意：
1. 如果无法确定具体食物，请给出最可能的猜测
2. 份量基于照片中食物的大小估算
3. 营养成分基于常见食物数据库估算
4. 只返回 JSON，不要其他文字`;

export const EXERCISE_ANALYSIS_PROMPT = `你是一个运动数据分析专家。请分析这张运动 App 截图，提取运动数据。

请以 JSON 格式返回：
{
  "exercise_type": "运动类型（如：跑步、骑行、游泳、步行等）",
  "duration_minutes": 运动时长（分钟）,
  "calories_burned": 消耗卡路里,
  "distance_km": 距离（公里，如果有）,
  "heart_rate_avg": 平均心率（如果有）,
  "timestamp": "运动时间（ISO 格式，如果能识别）",
  "confidence": "识别置信度：high/medium/low"
}

注意：
1. 优先从截图中的数字识别
2. 如果某些数据无法识别，设为 null
3. 只返回 JSON，不要其他文字`;
```

```typescript
// services/ai/parsers.ts
// 响应解析器

import { FoodItem } from '@/types/diet';
import { ExerciseRecord } from '@/types/exercise';

interface DietAnalysisResult {
  foods: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  confidence: 'high' | 'medium' | 'low';
}

interface ExerciseAnalysisResult {
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm: number | null;
  heartRateAvg: number | null;
  timestamp: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export function parseDietAnalysis(data: any): DietAnalysisResult {
  return {
    foods: data.foods.map((f: any) => ({
      name: f.name,
      portion: f.portion,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
    })),
    total: {
      calories: data.total.calories,
      protein: data.total.protein,
      carbs: data.total.carbs,
      fat: data.total.fat,
    },
    mealType: data.meal_type,
    confidence: data.confidence,
  };
}

export function parseExerciseAnalysis(data: any): ExerciseAnalysisResult {
  return {
    exerciseType: data.exercise_type,
    durationMinutes: data.duration_minutes,
    caloriesBurned: data.calories_burned,
    distanceKm: data.distance_km,
    heartRateAvg: data.heart_rate_avg,
    timestamp: data.timestamp,
    confidence: data.confidence,
  };
}
```

### 4. Health Connect 模块 (services/health/)

```typescript
// services/health/healthConnect.ts
// Android Health Connect 集成

import { Platform } from 'react-native';
import { WeightRecord, ExerciseRecord } from '@/types';

class HealthConnectService {
  private isAvailable = false;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      // 检查 Health Connect 是否可用
      // 这里需要使用 expo-health-connect 或原生模块
      this.isAvailable = true;
      return true;
    } catch (error) {
      console.error('Health Connect 初始化失败:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      // 请求权限
      // 读取体重、运动、步数、心率
      return true;
    } catch (error) {
      console.error('权限请求失败:', error);
      return false;
    }
  }

  async readWeightRecords(startDate: Date, endDate: Date): Promise<WeightRecord[]> {
    if (!this.isAvailable) return [];

    try {
      // 读取体重记录
      // 转换为应用数据格式
      return [];
    } catch (error) {
      console.error('读取体重失败:', error);
      return [];
    }
  }

  async readExerciseRecords(startDate: Date, endDate: Date): Promise<ExerciseRecord[]> {
    if (!this.isAvailable) return [];

    try {
      // 读取运动记录
      // 映射运动类型
      return [];
    } catch (error) {
      console.error('读取运动失败:', error);
      return [];
    }
  }

  async syncData(): Promise<{ weight: number; exercise: number }> {
    // 同步数据逻辑
    return { weight: 0, exercise: 0 };
  }
}

export const healthConnectService = new HealthConnectService();
```

### 5. 图片服务模块 (services/image/)

```typescript
// services/image/camera.ts
// 相机和图片选择

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface ImageResult {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

export async function takePhoto(): Promise<ImageResult | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error('需要相机权限');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 || '',
    width: asset.width,
    height: asset.height,
  };
}

export async function pickImage(): Promise<ImageResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('需要相册权限');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 || '',
    width: asset.width,
    height: asset.height,
  };
}

export async function saveImage(uri: string, filename: string): Promise<string> {
  const directory = `${FileSystem.documentDirectory}images/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const destination = `${directory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });

  return destination;
}

export async function deleteImage(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    // 忽略文件不存在的错误
  }
}
```

---

## 🔄 数据流设计

### 1. 饮食记录数据流

```
┌─────────────────────────────────────────────────────────────┐
│  饮食记录数据流                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户操作                    服务层                 数据层    │
│     │                          │                     │      │
│     │  1. 拍照/选择照片         │                     │      │
│     ├─────────────────────────→│                     │      │
│     │                          │  2. 调用 AI API     │      │
│     │                          ├────────────────────→│      │
│     │                          │                     │      │
│     │                          │  3. 返回识别结果    │      │
│     │                          │←────────────────────┤      │
│     │                          │                     │      │
│     │  4. 显示结果，用户编辑    │                     │      │
│     │←─────────────────────────┤                     │      │
│     │                          │                     │      │
│     │  5. 确认保存              │                     │      │
│     ├─────────────────────────→│                     │      │
│     │                          │  6. 保存到 SQLite   │      │
│     │                          ├────────────────────→│      │
│     │                          │                     │      │
│     │                          │  7. 保存成功        │      │
│     │                          │←────────────────────┤      │
│     │                          │                     │      │
│     │  8. 更新 UI              │                     │      │
│     │←─────────────────────────┤                     │      │
│     │                          │                     │      │
└─────────────────────────────────────────────────────────────┘
```

### 2. 状态更新流程

```
┌─────────────────────────────────────────────────────────────┐
│  Zustand 状态更新流程                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Component                    Store                 DB      │
│     │                          │                     │      │
│     │  1. 调用 action          │                     │      │
│     ├─────────────────────────→│                     │      │
│     │                          │  2. 执行数据库操作  │      │
│     │                          ├────────────────────→│      │
│     │                          │                     │      │
│     │                          │  3. 返回结果        │      │
│     │                          │←────────────────────┤      │
│     │                          │                     │      │
│     │                          │  4. 更新 state      │      │
│     │                          │  (set({...}))       │      │
│     │                          │                     │      │
│     │  5. 自动重新渲染         │                     │      │
│     │←─────────────────────────┤                     │      │
│     │                          │                     │      │
└─────────────────────────────────────────────────────────────┘
```

### 3. AI 分析数据流

```
┌─────────────────────────────────────────────────────────────┐
│  AI 分析数据流                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  拍照 → Base64 编码 → 构建请求 → AI API → 解析响应          │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐    │
│  │  相机   │ → │  图片   │ → │  AI     │ → │  响应   │    │
│  │  拍照   │   │  编码   │   │  请求   │   │  解析   │    │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘    │
│                                                             │
│  错误处理：                                                  │
│  - 网络错误 → 提示重试                                       │
│  - API 错误 → 显示错误信息                                   │
│  - 解析失败 → 允许手动输入                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API 接口设计

### AI 服务接口

```typescript
// services/ai/index.ts

export interface AIService {
  // 配置
  setConfig(config: AIConfig): void;
  getConfig(): AIConfig | null;
  testConnection(): Promise<boolean>;

  // 分析功能
  analyzeFood(imageBase64: string): Promise<DietAnalysisResult>;
  analyzeExercise(imageBase64: string): Promise<ExerciseAnalysisResult>;
}

export interface AIConfig {
  endpoint: string;      // API 地址
  apiKey: string;        // API Key
  model: string;         // 模型名称
}

export interface DietAnalysisResult {
  foods: FoodItem[];
  total: NutritionInfo;
  mealType: MealType;
  confidence: ConfidenceLevel;
}

export interface ExerciseAnalysisResult {
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm: number | null;
  heartRateAvg: number | null;
  timestamp: string | null;
  confidence: ConfidenceLevel;
}
```

### Health Connect 接口

```typescript
// services/health/index.ts

export interface HealthService {
  // 初始化
  initialize(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  isAvailable(): boolean;

  // 数据读取
  readWeight(startDate: Date, endDate: Date): Promise<WeightRecord[]>;
  readExercise(startDate: Date, endDate: Date): Promise<ExerciseRecord[]>;
  readSteps(date: Date): Promise<number>;

  // 数据同步
  syncWeight(): Promise<WeightRecord[]>;
  syncExercise(): Promise<ExerciseRecord[]>;
}

export interface WeightRecord {
  timestamp: Date;
  weight: number;        // kg
  source: 'health_connect' | 'manual';
}

export interface ExerciseRecord {
  timestamp: Date;
  type: string;
  duration: number;      // minutes
  calories: number;
  distance?: number;     // km
  source: 'health_connect' | 'manual';
}
```

### 导入导出接口

```typescript
// services/export/index.ts

export interface ExportService {
  // 导出
  exportToJSON(): Promise<string>;
  exportToFile(): Promise<string>;  // 返回文件路径

  // 导入
  importFromJSON(json: string): Promise<ImportResult>;
  importFromFile(uri: string): Promise<ImportResult>;
}

export interface ImportResult {
  success: boolean;
  imported: {
    dietRecords: number;
    exerciseRecords: number;
    weightRecords: number;
  };
  skipped: number;
  errors: string[];
}

export interface ExportData {
  version: string;
  exportedAt: string;
  app: {
    name: string;
    version: string;
  };
  data: {
    dietRecords: DietRecord[];
    exerciseRecords: ExerciseRecord[];
    weightRecords: WeightRecord[];
    goals: Goal[];
  };
}
```

---

## 🛡️ 错误处理策略

### 错误类型

```typescript
// types/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class AIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'AI_ERROR', details);
    this.name = 'AIError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class PermissionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'PERMISSION_ERROR', details);
    this.name = 'PermissionError';
  }
}
```

### 错误处理流程

```
┌─────────────────────────────────────────────────────────────┐
│  错误处理流程                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  捕获错误 → 分类处理 → 用户提示 → 日志记录                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  错误分类                                            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  网络错误 → 提示检查网络，提供重试按钮               │   │
│  │  AI 错误 → 提示重试，提供手动输入选项                │   │
│  │  数据库错误 → 提示重试，严重错误提示重启             │   │
│  │  权限错误 → 引导开启权限                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Toast 提示组件

```typescript
// components/ui/Toast.tsx

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// 使用示例
showToast({
  type: 'error',
  message: 'AI 识别失败，请重试',
  action: {
    label: '重试',
    onPress: () => retryAnalysis(),
  },
});
```

---

## 🧪 测试策略

### 单元测试

```typescript
// __tests__/utils/calculation.test.ts

describe('计算工具函数', () => {
  test('计算 BMI', () => {
    expect(calculateBMI(70, 175)).toBe(22.86);
  });

  test('计算卡路里目标', () => {
    expect(calculateCalorieTarget(70, 175, 25, 'male')).toBe(2200);
  });

  test('计算营养成分比例', () => {
    const ratio = calculateNutritionRatio(100, 50, 30);
    expect(ratio.protein).toBeCloseTo(55.6);
    expect(ratio.carbs).toBeCloseTo(27.8);
    expect(ratio.fat).toBeCloseTo(16.7);
  });
});
```

### 集成测试

```typescript
// __tests__/stores/dietStore.test.ts

describe('DietStore', () => {
  beforeEach(async () => {
    await database.initialize();
  });

  test('添加饮食记录', async () => {
    const { addRecord, todayRecords } = useDietStore.getState();

    await addRecord({
      timestamp: new Date().toISOString(),
      foodsJson: JSON.stringify([{ name: '苹果', calories: 95 }]),
      totalCalories: 95,
      mealType: 'snack',
    });

    expect(todayRecords).toHaveLength(1);
    expect(todayRecords[0].totalCalories).toBe(95);
  });
});
```

### E2E 测试

```typescript
// e2e/dietRecord.test.ts

describe('饮食记录流程', () => {
  test('完整记录流程', async () => {
    await element(by.id('record-button')).tap();
    await element(by.id('diet-tab')).tap();
    await element(by.id('camera-button')).tap();

    // 模拟拍照
    await device.takeScreenshot('food');

    // 等待 AI 分析
    await waitFor(element(by.id('analysis-result')))
      .toBeVisible()
      .withTimeout(10000);

    // 确认保存
    await element(by.id('save-button')).tap();

    // 验证保存成功
    await expect(element(by.id('success-toast'))).toBeVisible();
  });
});
```

---

## 📦 依赖管理

### 核心依赖

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.0.0",
    "expo-sqlite": "~14.0.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-file-system": "~17.0.0",
    "expo-linear-gradient": "~14.0.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-safe-area-context": "~4.8.0",
    "react-native-screens": "~3.29.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.3.0"
  }
}
```

### 可选依赖

```json
{
  "optionalDependencies": {
    "react-native-health": "^1.19.0",
    "expo-health-connect": "~1.0.0",
    "react-native-chart-kit": "^6.12.0",
    "victory-native": "^37.0.0"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0",
    "detox": "^20.16.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 🚀 性能优化策略

### 1. 数据库优化

```typescript
// 使用索引加速查询
CREATE INDEX idx_diet_timestamp ON diet_records(timestamp);
CREATE INDEX idx_exercise_timestamp ON exercise_records(timestamp);

// 分页查询
const getRecords = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  return db.getAllAsync(
    'SELECT * FROM diet_records ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [pageSize, offset]
  );
};
```

### 2. 图片优化

```typescript
// 压缩图片
const compressImage = async (uri: string) => {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipulated.uri;
};
```

### 3. 状态优化

```typescript
// 使用 shallow compare 避免不必要的渲染
import { shallow } from 'zustand/shallow';

const { records, isLoading } = useDietStore(
  (state) => ({
    records: state.records,
    isLoading: state.isLoading,
  }),
  shallow
);
```

### 4. 列表优化

```typescript
// 使用 FlashList 替代 FlatList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={records}
  renderItem={({ item }) => <RecordCard record={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id.toString()}
/>
```

---

*文档版本：v1.0*
*最后更新：2026-06-03*
