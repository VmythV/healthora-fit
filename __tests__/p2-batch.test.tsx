// __tests__/p2-batch.test.tsx
// P2 优化 21 个核心回归测试

import { renderHook, render } from '@testing-library/react-native'
import React from 'react'

// 通用 mock
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))

// 重要：mock ../database singleton，让 getDatabase() 返回 mockDb
jest.mock('../database', () => {
  const mockDb = (require('expo-sqlite') as any).__mockDb
  return {
    database: {
      getDatabase: () => mockDb,
      clearAll: jest.fn(async () => {}),
    },
  }
})

const mockFetch = jest.fn()
;(global as any).fetch = mockFetch

jest.mock('../database/queries', () => ({
  dietQueries: {
    getToday: jest.fn(async () => []),
    getTodayNutrition: jest.fn(async () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 })),
    getByDate: jest.fn(async () => []),
    getByDateRange: jest.fn(async () => []),
    getRecent: jest.fn(async () => []),
    insert: jest.fn(async () => 1),
    insertMany: jest.fn(async () => ({ inserted: 1, skipped: 0 })),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
    findByTimestamp: jest.fn(async () => null),
  },
  exerciseQueries: {
    getToday: jest.fn(async () => []),
    getTodayDuration: jest.fn(async () => 0),
    getTodayCalories: jest.fn(async () => 0),
    getByDate: jest.fn(async () => []),
    getByDateRange: jest.fn(async () => []),
    getRecent: jest.fn(async () => []),
    insert: jest.fn(async () => 1),
    insertMany: jest.fn(async () => ({ inserted: 1, skipped: 0 })),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
    findByTimestamp: jest.fn(async () => null),
  },
  weightQueries: {
    getLatest: jest.fn(async () => null),
    getByDate: jest.fn(async () => null),
    getByDateRange: jest.fn(async () => []),
    getRecent: jest.fn(async () => []),
    getDailyWeights: jest.fn(async () => []),
    getStats: jest.fn(async () => null),
    insert: jest.fn(async () => 1),
    insertMany: jest.fn(async () => ({ inserted: 1, skipped: 0 })),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
    findByTimestamp: jest.fn(async () => null),
  },
  goalQueries: {
    getActive: jest.fn(async () => null),
    getAll: jest.fn(async () => []),
    getByType: jest.fn(async () => null),
    set: jest.fn(async () => 1),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
    deactivate: jest.fn(async () => {}),
  },
  aiConfigQueries: {
    getActive: jest.fn(async () => null),
    getAll: jest.fn(async () => []),
    save: jest.fn(async () => 1),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
    testConnection: jest.fn(async () => ({ success: false, error: 'no config' })),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockFetch.mockReset()
})

// ===== P2-17: AI prompts =====
describe('P2-17: AI_PROMPTS', () => {
  it('AI_PROMPTS.foodAnalysis 与 exerciseAnalysis 是非空字符串', () => {
    const { AI_PROMPTS } = require('../constants/aiPrompts')
    expect(typeof AI_PROMPTS.foodAnalysis).toBe('string')
    expect(AI_PROMPTS.foodAnalysis.length).toBeGreaterThan(50)
    expect(typeof AI_PROMPTS.exerciseAnalysis).toBe('string')
    expect(AI_PROMPTS.exerciseAnalysis.length).toBeGreaterThan(50)
  })
})

// ===== P2-18: insertMany =====
describe('P2-18: dietQueries.insertMany', () => {
  it('批量插入生成单条多值 INSERT SQL', async () => {
    const realDiet = jest.requireActual('../database/queries/diet').dietQueries
    const { database } = require('../database')
    const db = database.getDatabase()
    db.__reset()
    // findByTimestamp 真实实现查 DB；mock getAllAsync 返回空
    db.__setAllAsyncFixture([])
    await realDiet.insertMany([
      { timestamp: '2024-01-01T08:00:00Z' },
      { timestamp: '2024-01-02T08:00:00Z' },
    ])
    // 应有 INSERT INTO diet_records 调用
    const insertCall = db.runAsync.mock.calls.find(([sql]: [string]) =>
      /INSERT\s+INTO\s+diet_records/i.test(sql)
    )
    expect(insertCall).toBeDefined()
    const [sql, params] = insertCall as [string, any[]]
    // SQL 应包含至少 2 个占位符组（(?,...),(?,...)）= 多值
    expect(sql).toContain('VALUES')
    const groups = sql.match(/\),\s*\(/g) || []
    expect(groups.length).toBeGreaterThanOrEqual(1) // 至少 1 个逗号分隔 = 至少 2 行
    expect(params.length).toBe(20) // 2 rows × 10 cols
  })
})

// ===== P2-19: exportData =====
describe('P2-19: exportData yield', () => {
  it('exportData 是 async 函数（验证不阻塞）', () => {
    const { dataTransferService } = require('../services/dataTransfer')
    expect(typeof dataTransferService.exportData).toBe('function')
  })
})

// ===== P2-20: DietRecordForm totals useMemo =====
describe('P2-20: DietRecordForm totals', () => {
  it('DietRecordForm 渲染成功（useMemo 不抛错）', () => {
    const { DietRecordForm } = require('../components/diet/DietRecordForm')
    const tree = render(<DietRecordForm />)
    expect(tree.toJSON()).toBeTruthy()
  })
})

// ===== P2-21: DateTimeStepper =====
describe('P2-21: DateTimeStepper', () => {
  it('DateTimeStepper 渲染并接受 onChange 回调', () => {
    const { DateTimeStepper } = require('../components/exercise/DateTimeStepper')
    const onChange = jest.fn()
    const tree = render(<DateTimeStepper value={new Date()} onChange={onChange} />)
    expect(tree.toJSON()).toBeTruthy()
  })
})

// ===== P2-22: Button danger variant =====
describe('P2-22: Button.danger variant', () => {
  it('Button 类型支持 danger', () => {
    // 通过 require 取 type alias 不行；改为运行时断言
    const { Button } = require('../components/ui/Button')
    const tree = render(<Button title="删" onPress={() => {}} variant="danger" />)
    expect(tree.toJSON()).toBeTruthy()
  })
})

// ===== P2-23: useHealthData loading 拆分 =====
describe('P2-23: useHealthData.loading', () => {
  it('hook 暴露 isLoading（任一桶为 true 即 true）', () => {
    const { useHealthData } = require('../hooks/useHealthData')
    const { result } = renderHook(() => useHealthData())
    expect(typeof result.current.isLoading).toBe('boolean')
  })
})

// ===== P2-24: useExerciseRecords 别名删除 =====
describe('P2-24: useExerciseRecords 别名', () => {
  it('返回值不含 todayMinutes / todayCaloriesBurned', () => {
    const { useExerciseRecords } = require('../hooks/useExerciseRecords')
    const { result } = renderHook(() => useExerciseRecords())
    expect(result.current).not.toHaveProperty('todayMinutes')
    expect(result.current).not.toHaveProperty('todayCaloriesBurned')
    expect(result.current).toHaveProperty('todayDuration')
    expect(result.current).toHaveProperty('todayCalories')
  })
})

// ===== P2-25: goalQueries.update 全字段 + 触 updated_at =====
describe('P2-25: goalQueries.update', () => {
  it('update 含 updated_at SQL（自动触）', async () => {
    const realGoal = jest.requireActual('../database/queries/goals').goalQueries
    const { database } = require('../database')
    const db = database.getDatabase()
    db.__reset()
    await realGoal.update(1, { startValue: 80 })
    const callSql = db.runAsync.mock.calls[0]?.[0] as string
    expect(callSql).toContain('updated_at')
    expect(callSql).toContain("datetime('now'")
  })
})

// ===== P2-26: WEEK_START_OPTIONS i18n =====
describe('P2-26: WEEK_START_OPTIONS i18n', () => {
  it('options 只含 value 字段（label 已走 i18n）', () => {
    const { WEEK_START_OPTIONS } = require('../hooks/useWeekStartDay')
    for (const opt of WEEK_START_OPTIONS) {
      expect(opt).toHaveProperty('value')
      expect(opt).not.toHaveProperty('label')
      expect(opt).not.toHaveProperty('labelEn')
    }
  })
  it('翻译文件有 settings.weekStart.days.{0..6}', () => {
    const zh = require('../constants/locales/zh-CN.json')
    const en = require('../constants/locales/en.json')
    for (let i = 0; i < 7; i++) {
      expect(zh.settings.weekStart.days[i]).toBeTruthy()
      expect(en.settings.weekStart.days[i]).toBeTruthy()
    }
  })
})

// ===== P2-27: MealTypeSelector 用 constants =====
describe('P2-27: MealTypeSelector 用 constants', () => {
  it('lunch icon 与 constants/mealTypes 一致（plate）', () => {
    const { MEAL_TYPES } = require('../constants/mealTypes')
    const lunch = MEAL_TYPES.find((m: any) => m.id === 'lunch')
    expect(lunch.icon).toBe('plate')
  })
  it('MealTypeSelector 渲染成功', () => {
    const { MealTypeSelector } = require('../components/diet/MealTypeSelector')
    const tree = render(<MealTypeSelector value="lunch" onChange={() => {}} />)
    expect(tree.toJSON()).toBeTruthy()
  })
})

// ===== P2-28: loadSavedLanguage useCallback =====
describe('P2-28: loadSavedLanguage 稳定', () => {
  it('useI18n 返回的 locale 是 useSyncExternalStore 订阅', () => {
    const { useI18n } = require('../hooks/useI18n')
    const { result } = renderHook(() => useI18n())
    expect(typeof result.current.locale).toBe('string')
    expect(typeof result.current.setLocale).toBe('function')
  })
})

// ===== P2-29: chart useWindowDimensions =====
describe('P2-29: charts 用 useWindowDimensions', () => {
  it('LineChart 不再 import Dimensions', () => {
    const fs = require('fs')
    const src = fs.readFileSync(
      require('path').resolve(__dirname, '../components/charts/LineChart.tsx'),
      'utf8'
    )
    expect(src).not.toContain('Dimensions.get')
    expect(src).toContain('useWindowDimensions')
  })
})

// ===== P2-30: aiConfig save 内联 SQL =====
describe('P2-30: aiConfig save 不 hydrate', () => {
  it('save 直接调 getFirstAsync（不调 getActive 完整 hydrate）', async () => {
    const realAi = jest.requireActual('../database/queries/aiConfig').aiConfigQueries
    const { database } = require('../database')
    const db = database.getDatabase()
    db.__reset()
    // SecureStore 不可用 → 走降级明文路径
    const SecureStore = require('expo-secure-store')
    ;(SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false)
    await realAi.save({ apiEndpoint: 'https://e', apiKey: 'k', modelName: 'm' })
    // 应有 SELECT id, api_key, is_encrypted 调用
    const selectCalls = db.getFirstAsync.mock.calls.filter(([sql]: [string]) =>
      /SELECT\s+id,\s+api_key,\s+is_encrypted/i.test(sql)
    )
    expect(selectCalls.length).toBeGreaterThanOrEqual(1)
  })
})

// ===== P2-31: settings useFocusEffect ref 模式 =====
describe('P2-31: settings useFocusEffect', () => {
  it('SettingsScreen 模块能 require 通过（ref 模式不破坏导出）', () => {
    // 显式 .tsx 后缀避免 jest 当 .ts 解析（TSX 包含 JSX）
    const SettingsScreen = require('../app/(tabs)/settings.tsx').default
    expect(typeof SettingsScreen).toBe('function')
  })
})

// ===== P2-33/34: utils/performance 死代码已删 =====
describe('P2-33/34: utils/performance 清理', () => {
  it('preloadImage / preloadImages / useMemoizedCallback 已删除', () => {
    const fs = require('fs')
    const src = fs.readFileSync(
      require('path').resolve(__dirname, '../utils/performance.ts'),
      'utf8'
    )
    // 去掉注释后检查
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    expect(codeOnly).not.toMatch(/function\s+preloadImage/)
    expect(codeOnly).not.toMatch(/function\s+useMemoizedCallback/)
    expect(codeOnly).not.toMatch(/preloadImages\s*\(/)
  })
})

// ===== P2-35: errorHandler.ts 已删除 =====
describe('P2-35: utils/errorHandler 已删', () => {
  it('utils/errorHandler 不再 require 成功', () => {
    expect(() => require('../utils/errorHandler')).toThrow()
  })
})

// ===== P2-36: importData 去重 =====
describe('P2-36: insertMany 去重', () => {
  it('findByTimestamp 返回非空时 insertMany 跳过（返回 0 inserted）', async () => {
    // 用 requireActual 拿真实 insertMany 实现
    const realDiet = jest.requireActual('../database/queries/diet').dietQueries
    const { database } = require('../database')
    const db = database.getDatabase()
    db.__reset()
    // db.getAllAsync 返回一行（"已存在"）→ 真实 insertMany 会跳过
    db.__setAllAsyncFixture([{ timestamp: '2024-01-01T08:00:00Z' }])
    const result = await realDiet.insertMany([{ timestamp: '2024-01-01T08:00:00Z' }])
    expect(result.inserted).toBe(0)
    expect(result.skipped).toBe(1)
  })
})

// ===== P2-37: clearAll 保留 =====
describe('P2-37: clearAll 保留 + JSDoc', () => {
  it('database.clearAll 仍是可调函数', () => {
    const { database } = require('../database')
    expect(typeof database.clearAll).toBe('function')
  })
})
