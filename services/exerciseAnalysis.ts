// services/exerciseAnalysis.ts
// 运动截图分析服务

import { aiService } from './ai';
import { ExerciseAnalysisResult } from '@/types/exercise';

// 运动类型映射
const EXERCISE_TYPE_MAP: Record<string, string> = {
  '跑步': 'running',
  'running': 'running',
  '慢跑': 'running',
  'jogging': 'running',
  '步行': 'walking',
  'walking': 'walking',
  '走路': 'walking',
  '快走': 'walking',
  '骑行': 'cycling',
  'cycling': 'cycling',
  '骑车': 'cycling',
  '自行车': 'cycling',
  '游泳': 'swimming',
  'swimming': 'swimming',
  '力量训练': 'strength',
  'strength': 'strength',
  '举重': 'strength',
  'weightlifting': 'strength',
  '瑜伽': 'yoga',
  'yoga': 'yoga',
  'HIIT': 'hiit',
  'hiit': 'hiit',
  '高强度间歇': 'hiit',
};

/**
 * 运动截图分析服务
 */
export class ExerciseAnalysisService {
  /**
   * 分析运动截图
   */
  async analyzeScreenshot(imageUri: string): Promise<ExerciseAnalysisResult> {
    console.log('[AI] 开始分析运动截图');
    console.log('[AI] 图片 URI:', imageUri);

    // 确保 AI 配置已加载
    if (!aiService.isConfigured()) {
      console.log('[AI] 配置未加载，尝试加载...');
      await aiService.loadConfig();
    }

    if (!aiService.isConfigured()) {
      console.error('[AI] 配置加载后仍然不可用');
      throw new Error('AI 服务未配置，请先在设置中配置');
    }

    try {
      // 转换图片为 Base64
      const base64 = await aiService.imageToBase64(imageUri);
      console.log('[AI] 图片 Base64 长度:', base64.length, '字符');

      // 构建请求
      const prompt = `请分析这张运动截图，提取运动数据。这可能是运动 App 的截图、智能手表的运动记录、或者运动设备的显示屏。

请以 JSON 格式返回，格式如下：
{
  "exerciseType": "运动类型（如：running, walking, cycling, swimming, strength, yoga, hiit, other）",
  "durationMinutes": 运动时长（分钟）,
  "caloriesBurned": 消耗卡路里,
  "distanceKm": 距离（公里，如果没有则为 null）,
  "heartRateAvg": 平均心率（如果没有则为 null）,
  "timestamp": "截图中显示的运动时间（ISO 8601 格式，如截图中有时钟或时间信息则提取，否则为 null）",
  "confidence": "识别置信度（high/medium/low）"
}

注意：
1. 运动类型必须是以下之一：running, walking, cycling, swimming, strength, yoga, hiit, other
2. 如果无法识别具体运动类型，请使用 "other"
3. 时长必须是数字（分钟）
4. 卡路里必须是数字
5. timestamp 是截图中显示的运动开始时间，不是截图时间。如果截图中没有时间信息，则设为 null
6. 只返回 JSON，不要有其他文字`;

      const config = aiService.getConfig()!;
      const apiEndpoint = aiService.getApiEndpoint();
      console.log('[AI] 请求端点:', apiEndpoint);
      console.log('[AI] API 类型:', config.apiType);
      console.log('[AI] 模型:', config.model);
      let response: Response;

      if (config.apiType === 'responses') {
        // Responses API 格式
        console.log('[AI] 使用 Responses API 发送请求...');
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            input: [
              {
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: prompt,
                  },
                  {
                    type: 'input_image',
                    image_url: `data:image/jpeg;base64,${base64}`,
                  },
                ],
              },
            ],
            max_output_tokens: 500,
          }),
        });
      } else {
        // Chat Completions API 格式
        console.log('[AI] 使用 Chat Completions API 发送请求...');
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 500,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI] HTTP 状态:', response.status);
        console.error('[AI] 响应错误:', errorText);
        throw new Error('AI 识别失败，请重试');
      }

      console.log('[AI] HTTP 状态:', response.status, 'OK');
      const data = await response.json();
      console.log('[AI] 原始响应:', JSON.stringify(data).substring(0, 500));

      // 根据 API 类型解析响应
      let content: string | undefined;
      if (config.apiType === 'responses') {
        // Responses API 格式
        content = data.output?.[0]?.content?.[0]?.text || data.choices?.[0]?.message?.content;
      } else {
        // Chat Completions API 格式
        content = data.choices?.[0]?.message?.content;
      }

      console.log('[AI] 解析出的内容:', content ? content.substring(0, 300) : '(空)');

      if (!content) {
        console.error('[AI] 返回内容为空，完整响应:', JSON.stringify(data));
        throw new Error('AI 返回内容为空');
      }

      // 解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[AI] 未找到 JSON，原始内容:', content);
        throw new Error('AI 返回格式错误');
      }

      console.log('[AI] JSON 匹配:', jsonMatch[0].substring(0, 300));
      const result = JSON.parse(jsonMatch[0]);
      console.log('[AI] 解析结果:', JSON.stringify(result));

      // 映射运动类型
      const exerciseType = this.mapExerciseType(result.exerciseType);

      console.log('[AI] 分析完成:',
        `类型=${exerciseType},`,
        `时长=${result.durationMinutes}分钟,`,
        `卡路里=${result.caloriesBurned},`,
        `置信度=${result.confidence}`
      );

      return {
        exerciseType,
        durationMinutes: Math.round(result.durationMinutes || 0),
        caloriesBurned: Math.round(result.caloriesBurned || 0),
        distanceKm: result.distanceKm ? Number(result.distanceKm) : undefined,
        heartRateAvg: result.heartRateAvg ? Math.round(result.heartRateAvg) : undefined,
        timestamp: result.timestamp || undefined,
        confidence: result.confidence || 'medium',
        rawText: content,
      };
    } catch (error) {
      console.error('[AI] 运动截图分析失败:', error);
      throw error;
    }
  }

  /**
   * 映射运动类型
   */
  private mapExerciseType(type: string): string {
    if (!type) return 'other';

    // 直接匹配
    const lowerType = type.toLowerCase();
    if (EXERCISE_TYPE_MAP[lowerType]) {
      return EXERCISE_TYPE_MAP[lowerType];
    }

    // 模糊匹配
    for (const [key, value] of Object.entries(EXERCISE_TYPE_MAP)) {
      if (lowerType.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerType)) {
        return value;
      }
    }

    return 'other';
  }

  /**
   * 获取运动类型中文名称
   */
  getExerciseTypeName(type: string): string {
    const names: Record<string, string> = {
      running: '跑步',
      walking: '步行',
      cycling: '骑行',
      swimming: '游泳',
      strength: '力量训练',
      yoga: '瑜伽',
      hiit: 'HIIT',
      other: '其他',
    };
    return names[type] || '其他';
  }
}

export const exerciseAnalysisService = new ExerciseAnalysisService();
