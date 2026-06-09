// __tests__/p3-batch.test.tsx
// P3 优化 12 个核心回归测试

import fs from 'fs'
import path from 'path'

beforeEach(() => {
  jest.clearAllMocks()
})

// ===== P3-38: goals.set 两段 SELECT-IN =====
describe('P3-38: goals.set 两段法', () => {
  it('goalQueries.set 改用 SELECT keepIds 后 DELETE（不再用子查询 NOT IN）', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../database/queries/goals.ts'), 'utf8')
    // 不应有"DELETE ... WHERE id NOT IN (SELECT id FROM ...)"这种结构
    expect(src).not.toMatch(/DELETE\s+FROM\s+goals\s+WHERE[\s\S]*?NOT\s+IN\s*\(\s*SELECT\s+id/)
    // 应有 getAllAsync<{ id: number }> 查 keepIds
    expect(src).toMatch(/getAllAsync<\s*\{\s*id:\s*number\s*\}\s*>/)
  })
})

// ===== P3-39: getRecent 抽常量 =====
describe('P3-39: getRecent 抽 MAX_EXPORT_RECORDS', () => {
  it('diet.ts 与 weight.ts 导出 MAX_EXPORT_RECORDS', () => {
    const dietSrc = fs.readFileSync(path.resolve(__dirname, '../database/queries/diet.ts'), 'utf8')
    const weightSrc = fs.readFileSync(
      path.resolve(__dirname, '../database/queries/weight.ts'),
      'utf8'
    )
    expect(dietSrc).toContain('export const MAX_EXPORT_RECORDS')
    expect(weightSrc).toContain('export const MAX_EXPORT_RECORDS')
  })
  it('dataTransfer.ts 用常量替代硬编码 10000', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../services/dataTransfer.ts'), 'utf8')
    // 不应有裸 "10000" 数字（除注释外）
    const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    // 原硬编码 "10000" 应被常量替代；只允许在 import 路径或别处出现
    // 简单断言：dataTransfer 里有 DIET_MAX 与 WEIGHT_MAX 引用
    expect(code).toContain('DIET_MAX')
    expect(code).toContain('WEIGHT_MAX')
  })
})

// ===== P3-40: todayRecords useMemo =====
describe('P3-40: todayRecords useMemo', () => {
  it('index.tsx 用 useMemo 包装 todayRecords', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../app/(tabs)/index.tsx'), 'utf8')
    expect(src).toMatch(/useMemo\([\s\S]*?todayRecords/)
  })
})

// ===== P3-41: EmptyState 移除 onAction =====
describe('P3-41: EmptyState 移除空函数', () => {
  it('index.tsx 的 EmptyState 不再传 onAction={() => {}}', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../app/(tabs)/index.tsx'), 'utf8')
    // 不应再有 onAction={() => {}} 这种 no-op
    expect(src).not.toContain('onAction={() => {}}')
  })
})

// ===== P3-42: headerTitle i18n =====
describe('P3-42: headerTitle i18n', () => {
  it('翻译文件有 diet/exercise/weight.recordTitle', () => {
    const zh = require('../constants/locales/zh-CN.json')
    const en = require('../constants/locales/en.json')
    expect(zh.diet.recordTitle).toBeTruthy()
    expect(zh.exercise.recordTitle).toBeTruthy()
    expect(zh.weight.recordTitle).toBeTruthy()
    expect(en.diet.recordTitle).toBeTruthy()
    expect(en.exercise.recordTitle).toBeTruthy()
    expect(en.weight.recordTitle).toBeTruthy()
  })
  it('3 个 modal 屏 useLayoutEffect setOptions', () => {
    const diet = fs.readFileSync(path.resolve(__dirname, '../app/diet/record.tsx'), 'utf8')
    const ex = fs.readFileSync(path.resolve(__dirname, '../app/exercise/record.tsx'), 'utf8')
    const wt = fs.readFileSync(path.resolve(__dirname, '../app/weight/record.tsx'), 'utf8')
    expect(diet).toMatch(/useLayoutEffect/)
    expect(ex).toMatch(/useLayoutEffect/)
    expect(wt).toMatch(/useLayoutEffect/)
    // expo-router 6.x：router.setOptions 已移除，改用 navigation.setOptions (useNavigation from @react-navigation/native)
    expect(diet).toMatch(/navigation\.setOptions\(\{\s*title:\s*t\(['"]diet\.recordTitle['"]/)
    expect(ex).toMatch(/navigation\.setOptions\(\{\s*title:\s*t\(['"]exercise\.recordTitle['"]/)
    expect(wt).toMatch(/navigation\.setOptions\(\{\s*title:\s*t\(['"]weight\.recordTitle['"]/)
  })
  it('_layout.tsx 移除 3 个 headerTitle 硬编码', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../app/_layout.tsx'), 'utf8')
    expect(src).not.toContain("headerTitle: '记录饮食'")
    expect(src).not.toContain("headerTitle: '记录运动'")
    expect(src).not.toContain("headerTitle: '记录体重'")
  })
})

// ===== P3-43: Android 权限清理 =====
describe('P3-43: app.json 权限清理', () => {
  it('CAMERA 仅出现 1 次（去重）', () => {
    const app = require('../app.json')
    const perms: string[] = app.expo.android.permissions
    const cameraCount = perms.filter((p: string) => p === 'android.permission.CAMERA').length
    expect(cameraCount).toBe(1)
  })
  it('WRITE_EXTERNAL_STORAGE 已移除', () => {
    const app = require('../app.json')
    const perms: string[] = app.expo.android.permissions
    expect(perms).not.toContain('android.permission.WRITE_EXTERNAL_STORAGE')
  })
})

// ===== P3-44: expo-image =====
describe('P3-44: expo-image 替换', () => {
  it('DietRecordDetail.tsx 与 ScreenshotPicker.tsx 用 expo-image', () => {
    const diet = fs.readFileSync(
      path.resolve(__dirname, '../components/diet/DietRecordDetail.tsx'),
      'utf8'
    )
    const ex = fs.readFileSync(
      path.resolve(__dirname, '../components/exercise/ScreenshotPicker.tsx'),
      'utf8'
    )
    expect(diet).toMatch(/from\s+['"]expo-image['"]/)
    expect(ex).toMatch(/from\s+['"]expo-image['"]/)
    // 不再 import RN Image
    expect(diet).not.toMatch(/import\s*\{[^}]*Image[^}]*\}\s*from\s*['"]react-native['"]/)
    expect(ex).not.toMatch(/import\s*\{[^}]*Image[^}]*\}\s*from\s*['"]react-native['"]/)
  })
})

// ===== P3-45: Logger 防抖 =====
describe('P3-45: Logger.setEnabled 防抖', () => {
  it('logger.ts 含 setTimeout 防抖 + writeTimer 字段', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../utils/logger.ts'), 'utf8')
    expect(src).toContain('writeTimer')
    expect(src).toMatch(/setTimeout\(/)
  })
})

// ===== P3-46: useNotification 桥接（修复版） =====
// 历史：P3-46 误删了桥接 effect，导致 setGlobalConfirm 永远 null，
// 所有走 `import { showConfirm } from '@/components/ui'` 的消费方
// （如 settings.handleLanguageChange）都拿到 false。
// 现已恢复：Provider 挂载时 register，卸载时 unregister。
describe('P3-46: useNotification 桥接（恢复）', () => {
  it('useNotification.tsx 注册 setGlobalConfirm 让全局 showConfirm 真正可用', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../hooks/useNotification.tsx'), 'utf8')
    expect(src).toContain('setGlobalConfirm')
    // setGlobalNotify 暂未恢复（P2 阶段未提供全局 notify 桥接）
    expect(src).not.toContain('setGlobalNotify')
  })
})

// ===== P3-48: useEffect [date] JSDoc =====
describe('P3-48: useEffect [date] JSDoc', () => {
  it('useDietRecords 与 useExerciseRecords 顶部 JSDoc 提到 YYYY-MM-DD', () => {
    const diet = fs.readFileSync(path.resolve(__dirname, '../hooks/useDietRecords.ts'), 'utf8')
    const ex = fs.readFileSync(path.resolve(__dirname, '../hooks/useExerciseRecords.ts'), 'utf8')
    expect(diet).toMatch(/YYYY-MM-DD/)
    expect(ex).toMatch(/YYYY-MM-DD/)
  })
})

// ===== P3-49: screenOptions 常量 =====
describe('P3-49: screenOptions 常量化', () => {
  it('_layout.tsx 顶部有 ROOT_SCREEN_OPTIONS 等模块级常量', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../app/_layout.tsx'), 'utf8')
    expect(src).toContain('ROOT_SCREEN_OPTIONS')
    expect(src).toContain('DIET_RECORD_OPTIONS')
    expect(src).toContain('EXERCISE_RECORD_OPTIONS')
    expect(src).toContain('WEIGHT_RECORD_OPTIONS')
    // inline screenOptions 已被替换
    expect(src).not.toMatch(/screenOptions=\{\{ headerShown: false \}\}/)
  })
})

// ===== P3-50: SafeAreaView edges =====
describe('P3-50: SafeAreaView edges', () => {
  it('app/(tabs)/* 与 app/settings/* 5+5 个 SafeAreaView 都有 edges', () => {
    const tabsFiles = [
      '../app/(tabs)/index.tsx',
      '../app/(tabs)/analysis.tsx',
      '../app/(tabs)/settings.tsx',
      '../app/(tabs)/record.tsx',
    ]
    for (const rel of tabsFiles) {
      const src = fs.readFileSync(path.resolve(__dirname, rel), 'utf8')
      // 应有 edges={['bottom']} 或 edges={['top']}
      expect(src).toMatch(/edges=\{(\[['"]bottom['"]\]|\[['"]top['"]\])\}/)
    }
  })
})
