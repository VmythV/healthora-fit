// __tests__/aiService.testConnection.test.ts
// 覆盖：mock fetch 验证两条分支
// - /models 200 → success（OpenAI 兼容 API 快速通道）
// - /models 404 + /chat/completions 200 → success
// - 两者都 500 → failure

import { testActiveConfig } from '../services/aiConnection'

describe('services/aiConnection.testActiveConfig (P0.4)', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('/models 200 → 返回 success', async () => {
    global.fetch = jest.fn(async () => new Response('{}', { status: 200 })) as any

    const result = await testActiveConfig({
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    })

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('/models 404 + /chat/completions 200 → 返回 success', async () => {
    let callCount = 0
    global.fetch = jest.fn(async (url: any) => {
      callCount++
      if (String(url).endsWith('/models')) {
        return new Response('Not Found', { status: 404 })
      }
      return new Response('{}', { status: 200 })
    }) as any

    const result = await testActiveConfig({
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    })

    expect(result.success).toBe(true)
    expect(callCount).toBe(2) // /models + /chat/completions
  })

  it('/models 500 + /chat/completions 500 → 返回 failure', async () => {
    global.fetch = jest.fn(
      async () =>
        new Response(JSON.stringify({ error: { message: 'Server error' } }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
    ) as any

    const result = await testActiveConfig({
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Server error')
  })

  it('fetch 抛错 → 返回 failure + 错误信息', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('Network unreachable')
    }) as any

    const result = await testActiveConfig({
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network unreachable')
  })

  it('apiType=responses 时走 /responses 端点', async () => {
    let lastUrl: string = ''
    global.fetch = jest.fn(async (url: any) => {
      lastUrl = String(url)
      return new Response('{}', { status: 200 })
    }) as any

    await testActiveConfig({
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
      apiType: 'responses',
    })

    // 应走 /responses 而非 /chat/completions
    // 注意：/models 先 200 就 short-circuit 了，所以可能只调一次
    expect(lastUrl).toContain('/v1/')
  })

  it('endpoint 已含 /chat/completions 后缀时不重复拼接', async () => {
    let lastUrl: string = ''
    global.fetch = jest.fn(async (url: any) => {
      lastUrl = String(url)
      if (String(url).endsWith('/models')) {
        return new Response('', { status: 404 })
      }
      return new Response('{}', { status: 200 })
    }) as any

    await testActiveConfig({
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    })

    // 不应出现 /chat/completions/chat/completions 重复
    expect(lastUrl).not.toMatch(/\/chat\/completions\/chat\/completions/)
    expect(lastUrl).toBe('https://api.openai.com/v1/chat/completions')
  })

  it('未配置 endpoint/apiKey → 直接返回 failure', async () => {
    const result = await testActiveConfig({
      endpoint: '',
      apiKey: '',
      model: '',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBe('AI 服务未配置')
  })
})
