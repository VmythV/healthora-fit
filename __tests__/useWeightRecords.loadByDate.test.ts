// __tests__/useWeightRecords.loadByDate.test.ts
// 覆盖：P0.2 loadByDate bug 修复 —— 不再写到 setLatestWeight，而是写到 setRecords
// 原始 bug: `setLatestWeight(result)` 把单条记录写错 state
// 修复后: `setRecords(result ? [result] : [])` 正确写入 records 数组

// mock weightQueries，验证 getByDate 返回值被正确写入 state
jest.mock('../database/queries/weight', () => ({
  weightQueries: {
    getByDate: jest.fn(async (_date: string) => null),
    getLatest: jest.fn(async () => null),
    getRecent: jest.fn(async () => []),
    getStats: jest.fn(async () => null),
    getDailyWeights: jest.fn(async () => []),
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useWeightRecords } from '../hooks/useWeightRecords';
import { weightQueries } from '../database/queries/weight';

describe('hooks/useWeightRecords.loadByDate (P0.2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadByDate 把 getByDate 返回的单条记录写入 records 数组（不再是 latestWeight）', async () => {
    const mockRecord = {
      id: 1,
      timestamp: '2024-01-15T08:00:00Z',
      weight: 70.5,
      bodyFatPercentage: null,
      muscleMass: null,
      source: 'manual',
      note: null,
      createdAt: '2024-01-15T08:00:00Z',
    };
    (weightQueries.getByDate as jest.Mock).mockResolvedValue(mockRecord);

    const { result } = renderHook(() => useWeightRecords());

    await act(async () => {
      await result.current.loadByDate('2024-01-15');
    });

    // 关键回归：修复后 records 应包含这条记录
    expect(result.current.records).toEqual([mockRecord]);
    // latestWeight 应当仍是 null（getLatest 没被调过，loadByDate 不再污染它）
    expect(result.current.latestWeight).toBeNull();
  });

  it('loadByDate 当 getByDate 返回 null 时 records 置空数组', async () => {
    (weightQueries.getByDate as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useWeightRecords());

    await act(async () => {
      await result.current.loadByDate('2024-01-15');
    });

    expect(result.current.records).toEqual([]);
  });

  it('loadByDate 多次调用会覆盖前一次结果', async () => {
    const mockA = {
      id: 1, timestamp: '2024-01-15T08:00:00Z', weight: 70.0,
      bodyFatPercentage: null, muscleMass: null, source: 'manual',
      note: null, createdAt: '2024-01-15T08:00:00Z',
    };
    const mockB = {
      id: 2, timestamp: '2024-02-15T08:00:00Z', weight: 71.0,
      bodyFatPercentage: null, muscleMass: null, source: 'manual',
      note: null, createdAt: '2024-02-15T08:00:00Z',
    };
    // 注意：hook 挂载时 loadYesterday() 也会调 getByDate，所以这里需要 4 个值：
    // 1) loadYesterday 用，2) loadByDate('2024-01-15') 用，
    // 3) loadByDate 的 finally setIsLoading(false) 不调 getByDate，但第 2 次 loadByDate 需要 mockB，
    // 实际：loadYesterday(mockAny) + loadByDate(mockA) + loadByDate(mockB) = 3 个
    (weightQueries.getByDate as jest.Mock)
      .mockResolvedValueOnce(null)  // loadYesterday 在 mount 时
      .mockResolvedValueOnce(mockA)
      .mockResolvedValueOnce(mockB);

    const { result } = renderHook(() => useWeightRecords());

    // 等 mount 时的 loadYesterday / loadLatest 跑完
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.loadByDate('2024-01-15');
    });
    expect(result.current.records).toEqual([mockA]);

    await act(async () => {
      await result.current.loadByDate('2024-02-15');
    });
    expect(result.current.records).toEqual([mockB]);
  });
});
