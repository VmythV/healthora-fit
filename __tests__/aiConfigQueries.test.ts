// __tests__/aiConfigQueries.test.ts
// 覆盖：save 写入时 apiKey 走 SecureStore，DB 存的是 handle；getActive 读取时反查明文

import * as SecureStore from 'expo-secure-store'
import * as SQLite from 'expo-sqlite'

import { aiConfigQueries } from '../database/queries/aiConfig'

// 用 jest.mock 把 database 单例替换为 getDatabase() 返回 mockDb
jest.mock('../database', () => {
  const mockDb = (require('expo-sqlite') as any).__mockDb
  return {
    database: {
      getDatabase: () => mockDb,
    },
  }
})

describe('database/queries/aiConfig (P0.1)', () => {
  const mockDb = (SQLite as any).__mockDb

  beforeEach(() => {
    ;(SecureStore as any).__reset()
    mockDb.__reset()
    ;(SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true)
  })

  it('save() 把 apiKey 加密后存进 DB（存的是 handle 不是明文）', async () => {
    mockDb.__setFirstAsyncFixture(null) // 首次 getActive 返回 null
    mockDb.__setFirstAsyncFixture(null)

    const _id = await aiConfigQueries.save({
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-supersecret-1234567890',
      modelName: 'gpt-4o',
    })

    // 拿到所有 runAsync 调用，找到 INSERT/UPDATE
    const calls = mockDb.runAsync.mock.calls
    const insertOrUpdateCall = calls.find(
      ([sql]: [string]) => /INSERT\s+INTO\s+ai_config/i.test(sql) || /UPDATE\s+ai_config/i.test(sql)
    )
    expect(insertOrUpdateCall).toBeDefined()

    // 入参里 api_key 应该是 handle（ai_key_ 开头），不是明文
    const params = insertOrUpdateCall![1] as any[]
    const storedKey = params.find((p) => typeof p === 'string' && p.startsWith('ai_key_'))
    expect(storedKey).toBeDefined()
    expect(storedKey!.includes('sk-supersecret')).toBe(false)

    // is_encrypted 标记应该是 1
    const isEnc = params.find((p) => p === 1)
    expect(isEnc).toBeDefined()
  })

  it('getActive() 把 handle 反查回明文', async () => {
    // 先存
    mockDb.__setFirstAsyncFixture(null)
    await aiConfigQueries.save({
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-restore-test',
      modelName: 'gpt-4o',
    })

    // 模拟 getActive 第一次返回（带 is_encrypted=1, apiKey=handle）
    const handles = Array.from((SecureStore as any).__getAll().keys()) as string[]
    const handle = handles[handles.length - 1]
    mockDb.__setFirstAsyncFixture({
      id: 1,
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: handle,
      modelName: 'gpt-4o',
      isActive: 1,
      isEncrypted: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    })

    const result = await aiConfigQueries.getActive()
    expect(result).not.toBeNull()
    expect(result!.apiKey).toBe('sk-restore-test')
  })

  it('getActive() 对历史明文（is_encrypted=0）直接返回原值', async () => {
    mockDb.__setFirstAsyncFixture({
      id: 1,
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-legacy-plaintext',
      modelName: 'gpt-4o',
      isActive: 1,
      isEncrypted: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    })

    const result = await aiConfigQueries.getActive()
    expect(result!.apiKey).toBe('sk-legacy-plaintext')
    // 不应触发 SecureStore 读取
    expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith('sk-legacy-plaintext')
  })

  it('save() 已存在激活配置时 UPDATE 而不是 INSERT', async () => {
    // 模拟已有配置
    mockDb.__setFirstAsyncFixture({
      id: 5,
      apiEndpoint: 'https://old.api.com',
      apiKey: 'sk-old',
      modelName: 'old-model',
      isActive: 1,
      isEncrypted: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    })
    mockDb.__setFirstAsyncFixture({
      id: 5,
      apiEndpoint: 'https://old.api.com',
      apiKey: 'sk-old',
      modelName: 'old-model',
      isActive: 1,
      isEncrypted: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    })

    await aiConfigQueries.save({
      apiEndpoint: 'https://new.api.com',
      apiKey: 'sk-new-secret',
      modelName: 'new-model',
    })

    // 应有 UPDATE 调用
    const updateCall = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
      /UPDATE\s+ai_config/i.test(sql)
    )
    expect(updateCall).toBeDefined()
    // 旧 apiKey 句柄（如果之前是加密的）应被清理；这里 isEncrypted=0，不调 deleteItemAsync
  })

  it('SecureStore 不可用时降级为明文 + is_encrypted=0', async () => {
    ;(SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false)
    mockDb.__setFirstAsyncFixture(null)

    await aiConfigQueries.save({
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-fallback-plain',
      modelName: 'gpt-4o',
    })

    const calls = mockDb.runAsync.mock.calls
    const call = calls.find(([sql]: [string]) => /INSERT\s+INTO\s+ai_config/i.test(sql))
    expect(call).toBeDefined()
    const params = call![1] as any[]
    // api_key 应是明文
    expect(params).toContain('sk-fallback-plain')
    // is_encrypted 应该是 0
    expect(params).toContain(0)
  })
})
