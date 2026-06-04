// services/exerciseAnalysis.ts
// 运动截图分析服务

import { aiService } from './ai';

export interface ExerciseAnalysisResult {
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm?: number;
  heartRate?: number;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
}

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
    // 确保 AI 配置已加载
    if (!aiService.isConfigured()) {
      await aiService.loadConfig();
    }

    if (!aiService.isConfigured()) {
      throw new Error('AI 服务未配置，请先在设置中配置');
    }

    try {
      // 转换图片为 Base64
      const base64 = await aiService.imageToBase64(imageUri);

      // 构建请求
      const prompt = `请分析这张运动截图，提取运动数据。这可能是运动 App 的截图、智能手表的运动记录、或者运动设备的显示屏。

请以 JSON 格式返回，格式如下：
{
  "exerciseType": "运动类型（如：running, walking, cycling, swimming, strength, yoga, hiit, other）",
  "durationMinutes": 运动时长（分钟）,
  "caloriesBurned": 消耗卡路里,
  "distanceKm": 距离（公里，如果没有则为 null）,
  "heartRate": 平均心率（如果没有则为 null）,
  "confidence": "识别置信度（high/medium/low）"
}

注意：
1. 运动类型必须是以下之一：running, walking, cycling, swimming, strength, yoga, hiit, other
2. 如果无法识别具体运动类型，请使用 "other"
3. 时长必须是数字（分钟）
4. 卡路里必须是数字
5. 只返回 JSON，不要有其他文字`;

      const config = aiService.getConfig()!;
      const apiEndpoint = aiService.getApiEndpoint();
      let response: Response;

      if (config.apiType === 'responses') {
        // Responses API 格式
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
        console.error('AI 请求失败:', errorText);
        throw new Error('AI 识别失败，请重试');
      }

      const data = await response.json();

      // 根据 API 类型解析响应
      let content: string | undefined;
      if (config.apiType === 'responses') {
        // Responses API 格式
        content = data.output?.[0]?.content?.[0]?.text || data.choices?.[0]?.message?.content;
      } else {
        // Chat Completions API 格式
        content = data.choices?.[0]?.message?.content;
      }

      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      // 解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 返回格式错误');
      }

      const result = JSON.parse(jsonMatch[0]);

      // 映射运动类型
      const exerciseType = this.mapExerciseType(result.exerciseType);

      return {
        exerciseType,
        durationMinutes: Math.round(result.durationMinutes || 0),
        caloriesBurned: Math.round(result.caloriesBurned || 0),
        distanceKm: result.distanceKm ? Number(result.distanceKm) : undefined,
        heartRate: result.heartRate ? Math.round(result.heartRate) : undefined,
        confidence: result.confidence || 'medium',
        rawText: content,
      };
    } catch (error) {
      console.error('运动截图分析失败:', error);
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
