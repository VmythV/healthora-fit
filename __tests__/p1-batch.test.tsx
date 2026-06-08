// __tests__/p1-batch.test.ts
// 8 项 P1 优化的最小回归测试（11 个 sub-it）
//
// 覆盖：
// - P1-6: BaseVisionClient (chat-completions + responses 双分支)
// - P1-7: Icon 查表 + memo
// - P1-8: DietRecordList 行 memo（最简版用空 list 即可触发）
// - P1-9: useDietRecords.addRecord 同步刷 records
// - P1-11: NotificationProvider value memo
// - P1-12: AnalysisScreen 模块能 require
// - P1-13: i18n subscribe + useSyncExternalStore
// - P1-15: utils/animations 已删除 + AnimatedCard 渲染

import { renderHook, act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

// ===== 通用 mock =====

// 抹掉 AnimatedCard 内 useEffect 的警告
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// P1-6 需要的 fetch mock
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// P1-9 需要的 dietQueries mock
jest.mock('../database/queries', () => ({
  dietQueries: {
    getToday: jest.fn(async () => []),
    getTodayNutrition: jest.fn(async () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 })),
    getByDate: jest.fn(async () => []),
    getByDateRange: jest.fn(async () => []),
    getRecent: jest.fn(async () => []),
    insert: jest.fn(async () => 42),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
  },
  exerciseQueries: {
    getToday: jest.fn(async () => []),
    getTodayDuration: jest.fn(async () => 0),
    getTodayCalories: jest.fn(async () => 0),
    getByDate: jest.fn(async () => []),
    getByDateRange: jest.fn(async () => []),
    insert: jest.fn(async () => 1),
    update: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
  },
}));

// P1-11 需要的 showNotification/showConfirm stub（无需真正调用）
jest.mock('../components/ui/Toast', () => ({
  setGlobalNotify: jest.fn(),
  ToastItemView: () => null,
  showNotification: jest.fn(),
}));
jest.mock('../components/ui/AlertModal', () => ({
  setGlobalConfirm: jest.fn(),
  AlertModalView: () => null,
  showConfirm: jest.fn(async () => false),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
});

// ===== P1-6：BaseVisionClient =====
describe('P1-6: BaseVisionClient', () => {
  it('callVisionApi (chat-completions) 解析首个 {…} JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '噪音 { "x": 1, "y": "z" } 噪音' } }] }),
    });
    const { callVisionApi } = require('../services/vision/baseVisionClient');
    const json = await callVisionApi({
      apiType: 'chat-completions',
      endpoint: 'https://e/chat/completions',
      apiKey: 'k',
      model: 'm',
      base64: 'b64',
      prompt: 'p',
      maxTokens: 100,
    });
    expect(JSON.parse(json)).toEqual({ x: 1, y: 'z' });
  });

  it('callVisionApi (responses) 走 input/output 字段 + body 用 max_output_tokens', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: [{ content: [{ text: 'prefix { "ok": true }' }] }] }),
    });
    const { callVisionApi } = require('../services/vision/baseVisionClient');
    const json = await callVisionApi({
      apiType: 'responses',
      endpoint: 'https://e/responses',
      apiKey: 'k',
      model: 'm',
      base64: 'b64',
      prompt: 'p',
      maxTokens: 100,
    });
    expect(JSON.parse(json)).toEqual({ ok: true });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.input).toBeDefined();
    expect(body.max_output_tokens).toBe(100);
  });
});

// ===== P1-7：Icon 查表 =====
describe('P1-7: Icon', () => {
  it('已知 name 命中查表（render 成功）', () => {
    const { Icon } = require('../components/icons/Icon');
    const tree = render(<Icon name="home" size={16} color="#fff" />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('未知 name 返回 null（不抛错）', () => {
    const { Icon } = require('../components/icons/Icon');
    // @ts-expect-error 测试边界
    const tree = render(<Icon name="nonexistent-icon-name" />);
    expect(tree.toJSON()).toBeNull();
  });
});

// ===== P1-8：DietRecordList 行 memo =====
describe('P1-8: DietRecordList 行 memo', () => {
  it('同 props 二次 render 不抛错（renderItem 已 useCallback）', () => {
    const { DietRecordList } = require('../components/diet/DietRecordList');
    const onPress = jest.fn();
    const tree1 = render(<DietRecordList date={undefined} onRecordPress={onPress} />);
    const tree2 = render(<DietRecordList date={undefined} onRecordPress={onPress} />);
    // 两次 render 都成功（无抛错、返回有效 tree）
    expect(tree1.toJSON()).toBeTruthy();
    expect(tree2.toJSON()).toBeTruthy();
  });
});

// ===== P1-9：useDietRecords.addRecord 同步刷 records =====
describe('P1-9: useDietRecords.addRecord 同步刷 records', () => {
  it('addRecord 后 records 包含新插入项（即便 date 为空）', async () => {
    const { dietQueries } = require('../database/queries');
    const mockRecord = {
      id: 42,
      timestamp: new Date().toISOString(),
      mealType: 'lunch',
      totalCalories: 500,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      foodsJson: null,
      note: null,
      isEdited: false,
      createdAt: '',
      updatedAt: '',
    };
    (dietQueries.getByDate as jest.Mock).mockResolvedValue([mockRecord]);

    const { useDietRecords } = require('../hooks/useDietRecords');
    const { result } = renderHook(() => useDietRecords(undefined));

    await act(async () => {
      await result.current.addRecord({
        timestamp: new Date().toISOString(),
      });
    });

    expect(result.current.records.length).toBe(1);
    expect(result.current.records[0].id).toBe(42);
  });
});

// ===== P1-11：NotificationProvider value memo =====
describe('P1-11: NotificationProvider value memo', () => {
  it('showNotification/showConfirm 引用稳定（不随 re-render 变化）', () => {
    const { NotificationProvider, useNotification } = require('../hooks/useNotification');
    let captured: any;
    function Probe() {
      captured = useNotification();
      return null;
    }
    const { rerender } = render(
      <NotificationProvider>
        <Probe />
      </NotificationProvider>
    );
    const firstShowNotification = captured.showNotification;
    const firstShowConfirm = captured.showConfirm;
    rerender(
      <NotificationProvider>
        <Probe />
      </NotificationProvider>
    );
    expect(captured.showNotification).toBe(firstShowNotification);
    expect(captured.showConfirm).toBe(firstShowConfirm);
  });
});

// ===== P1-12：AnalysisScreen 模块能 require =====
describe('P1-12: AnalysisScreen', () => {
  it('模块能 require（typing OK、合并 state 后无运行时错）', () => {
    // AnalysisScreen 内部用 useDatabase / useGoals / useFocusEffect，
    // 完整渲染需要 NavigationContainer；这里只断言模块能 require 通过。
    const AnalysisScreen = require('../app/(tabs)/analysis').default;
    expect(typeof AnalysisScreen).toBe('function');
  });
});

// ===== P1-13：i18n subscribe + useSyncExternalStore =====
describe('P1-13: i18n subscribe + useSyncExternalStore', () => {
  it('setLocale 触发 subscribe 回调；unsubscribe 后不再触发', () => {
    const { setLocale, subscribe, getSnapshot } = require('../constants/i18n');
    const cb = jest.fn();
    const off = subscribe(cb);
    setLocale('en');
    expect(cb).toHaveBeenCalledTimes(1);
    expect(getSnapshot()).toBe('en');
    off();
    setLocale('zh-CN');
    expect(cb).toHaveBeenCalledTimes(1);  // off 后不再触发
  });

  it('useI18n 在 setLocale 后返回新 locale（useSyncExternalStore）', () => {
    const { useI18n } = require('../hooks/useI18n');
    const { setLocale } = require('../constants/i18n');
    const { result, rerender } = renderHook(() => useI18n());
    const initial = result.current.locale;
    act(() => {
      setLocale(initial === 'en' ? 'zh-CN' : 'en');
    });
    rerender();
    expect(result.current.locale).not.toBe(initial);
  });
});

// ===== P1-15：utils/animations 已删除 + AnimatedCard 渲染 =====
describe('P1-15: utils/animations 删除 + AnimatedCard Reanimated 4', () => {
  it('utils/animations 已删除（require 抛 Module not found）', () => {
    expect(() => require('../utils/animations')).toThrow();
  });

  it('AnimatedCard 渲染并接受原有 props', () => {
    const { AnimatedCard } = require('../components/AnimatedCard');
    const tree = render(
      <AnimatedCard animationType="slideUp" delay={0}>
        <Text>x</Text>
      </AnimatedCard>
    );
    expect(tree.toJSON()).toBeTruthy();
  });
});
