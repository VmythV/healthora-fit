// services/aiConnection.ts
// 共享的 AI 连接测试逻辑
//
// P0.4 重构：原 database/queries/aiConfig.ts:128-231 与 services/ai.ts:137-229
// 各有 ~100 行重复实现，合并到本文件统一维护。
//
// 支持的 API 提供商：
// - OpenAI 兼容 API（使用 /models 端点）
// - 火山引擎等（使用简单聊天请求测试）
// - Responses API（使用 /responses 端点）

import { logger } from '@/utils/logger'

export type ApiType = 'chat-completions' | 'responses'

export interface ActiveConfig {
  endpoint: string
  apiKey: string
  model: string
  apiType?: ApiType
}

export interface TestResult {
  success: boolean
  error?: string
}

/**
 * 测试 AI 服务连接。
 *
 * 调用方：
 * - database/queries/aiConfig.ts:aiConfigQueries.testConnection
 * - services/ai.ts:AiService.testConnection
 */
export async function testActiveConfig(config: ActiveConfig): Promise<TestResult> {
  if (!config.endpoint || !config.apiKey) {
    return { success: false, error: 'AI 服务未配置' }
  }

  try {
    // 1) 尝试 /models 端点（OpenAI 兼容 API 走这条最快）
    const baseUrl = config.endpoint.replace(/\/(chat\/completions|responses)$/, '')
    try {
      const modelsResponse = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      if (modelsResponse.ok) {
        return { success: true }
      }
    } catch {
      // /models 端点不可用，继续尝试 POST 测试
    }

    // 2) 根据 API 类型发送测试请求
    const isResponses = config.apiType === 'responses' || config.endpoint.endsWith('/responses')

    const apiEndpoint = isResponses
      ? config.endpoint.endsWith('/responses')
        ? config.endpoint
        : `${config.endpoint}/responses`
      : config.endpoint.endsWith('/chat/completions')
        ? config.endpoint
        : `${config.endpoint}/chat/completions`

    const headers = {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    }

    const body = isResponses
      ? {
          model: config.model,
          input: [
            {
              role: 'user',
              content: [{ type: 'input_text', text: 'Hi' }],
            },
          ],
          max_output_tokens: 5,
        }
      : {
          model: config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }

    const testResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (testResponse.ok) {
      return { success: true }
    }

    // 解析错误信息
    let errorMessage = '连接失败'
    try {
      const errorData = await testResponse.json()
      errorMessage = errorData.error?.message || errorData.message || `HTTP ${testResponse.status}`
    } catch {
      errorMessage = `HTTP ${testResponse.status}`
    }
    return { success: false, error: errorMessage }
  } catch (err) {
    logger.error('[aiConnection] testActiveConfig 失败:', err)
    const message = err instanceof Error ? err.message : '网络连接失败'
    return { success: false, error: message }
  }
}
