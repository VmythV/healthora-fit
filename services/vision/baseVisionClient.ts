// services/vision/baseVisionClient.ts
// 共享的视觉 API 客户端 —— 抽离自 services/ai.ts 与 services/exerciseAnalysis.ts
//
// 设计目标：
// - imageToBase64：纯函数，从 URI 读取图片转 base64
// - callVisionApi：构造请求 body（按 apiType 分支）、调用 fetch、解析响应、提取首个 {…} JSON
// - 两个 service 各自负责 prompt 拼装与业务映射，不重复实现网络层

import { File } from 'expo-file-system'
import { logger } from '@/utils/logger'

export type ApiType = 'chat-completions' | 'responses'

export interface CallVisionApiParams {
  apiType: ApiType
  endpoint: string
  apiKey: string
  model: string
  base64: string
  prompt: string
  maxTokens: number
}

/**
 * 把图片 URI 转为 base64 字符串。
 * 失败时抛 '图片读取失败' 错误。
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const file = new File(uri)
    return await file.base64()
  } catch (err) {
    logger.error('[vision] imageToBase64 失败:', err)
    throw new Error('图片读取失败')
  }
}

/**
 * 提取响应中的文本内容。
 * 兼容 Responses API（output[0].content[0].text）与 Chat Completions（choices[0].message.content）。
 */
function extractContent(data: any, apiType: ApiType): string | undefined {
  if (apiType === 'responses') {
    return data.output?.[0]?.content?.[0]?.text || data.choices?.[0]?.message?.content
  }
  return data.choices?.[0]?.message?.content
}

/**
 * 构造请求体（按 apiType 分支）
 */
function buildRequestBody(params: CallVisionApiParams): any {
  const { apiType, model, base64, prompt, maxTokens } = params
  const imageUrl = `data:image/jpeg;base64,${base64}`
  if (apiType === 'responses') {
    return {
      model,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageUrl },
          ],
        },
      ],
      max_output_tokens: maxTokens,
    }
  }
  return {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: maxTokens,
  }
}

/**
 * 顶层 API：调用视觉模型，提取返回的 JSON 文本。
 *
 * - 失败（非 2xx）抛 'AI 识别失败，请重试'
 * - 响应内容为空抛 'AI 返回内容为空'
 * - 找不到 {…} 抛 'AI 返回格式错误'
 *
 * 返回：首个 JSON 字符串（不含前后噪音），由调用方 JSON.parse。
 */
export async function callVisionApi(params: CallVisionApiParams): Promise<string> {
  const { apiType, endpoint, apiKey } = params

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildRequestBody(params)),
  })

  if (!response.ok) {
    const errText = await response.text()
    logger.error('[vision] HTTP', response.status, errText)
    throw new Error('AI 识别失败，请重试')
  }

  const data = await response.json()
  const content = extractContent(data, apiType)

  if (!content) {
    logger.error('[vision] 内容为空:', JSON.stringify(data))
    throw new Error('AI 返回内容为空')
  }

  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    logger.error('[vision] 未找到 JSON:', content)
    throw new Error('AI 返回格式错误')
  }

  return match[0]
}
