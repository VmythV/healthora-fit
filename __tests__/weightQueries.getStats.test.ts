// __tests__/weightQueries.getStats.test.ts
// 覆盖：合并 SQL 后字段完整；first 是最早一条的 weight；last 是最晚一条

import * as SQLite from 'expo-sqlite'

import { weightQueries } from '../database/queries/weight'

jest.mock('../database', () => {
  const mockDb = (require('expo-sqlite') as any).__mockDb
  return {
    database: {
      getDatabase: () => mockDb,
    },
  }
})

describe('database/queries/weight.getStats (P0.3)', () => {
  const mockDb = (SQLite as any).__mockDb

  beforeEach(() => {
    mockDb.__reset()
  })

  it('返回字段完整（min/max/avg/first/last/change）', async () => {
    // 模拟单条 SQL 返回：MIN/MAX/AVG + first/last 都来自子查询
    mockDb.__setFirstAsyncFixture({
      min: 68.0,
      max: 72.0,
      avg: 70.0,
      first: 72.0, // 最早记录
      last: 68.0, // 最晚记录
    })

    const result = await weightQueries.getStats('2024-01-01', '2024-01-31')
    expect(result).not.toBeNull()
    expect(result).toEqual({
      min: 68.0,
      max: 72.0,
      avg: 70.0,
      first: 72.0,
      last: 68.0,
      change: -4.0, // last - first = 68 - 72 = -4
    })
  })

  it('min/max 为 null 时返回 null（空数据）', async () => {
    mockDb.__setFirstAsyncFixture({
      min: null,
      max: null,
      avg: null,
      first: null,
      last: null,
    })

    const result = await weightQueries.getStats('2024-01-01', '2024-01-31')
    expect(result).toBeNull()
  })

  it('avg 保留 1 位小数（70.05 → 70.1）', async () => {
    mockDb.__setFirstAsyncFixture({
      min: 70.0,
      max: 70.1,
      avg: 70.05,
      first: 70.0,
      last: 70.1,
    })

    const result = await weightQueries.getStats('2024-01-01', '2024-01-31')
    expect(result!.avg).toBe(70.1)
  })

  it('first/last 缺失时 change 为 0', async () => {
    mockDb.__setFirstAsyncFixture({
      min: 70.0,
      max: 70.0,
      avg: 70.0,
      first: null,
      last: null,
    })

    const result = await weightQueries.getStats('2024-01-01', '2024-01-31')
    expect(result!.change).toBe(0)
  })

  it('只调用一次 db.getFirstAsync（不再 3 次串行）', async () => {
    mockDb.__setFirstAsyncFixture({
      min: 70.0,
      max: 70.0,
      avg: 70.0,
      first: 70.0,
      last: 70.0,
    })

    await weightQueries.getStats('2024-01-01', '2024-01-31')

    // P0.3 关键回归保护：必须只有 1 次 getFirstAsync
    expect(mockDb.getFirstAsync).toHaveBeenCalledTimes(1)
  })
})
