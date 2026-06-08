// services/exerciseAnalysis.ts
// 运动截图分析服务
//
// P1-6：复用 services/vision/baseVisionClient 的 imageToBase64 + callVisionApi
// 减少与 services/ai.ts 的代码重复

import { logger } from '@/utils/logger';
import { aiService } from './ai';
import { ExerciseAnalysisResult } from '@/types/exercise';
import { imageToBase64, callVisionApi } from './vision/baseVisionClient';

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
    logger.log('[AI] 开始分析运动截图');
    logger.log('[AI] 图片 URI:', imageUri);

    // 确保 AI 配置已加载
    if (!aiService.isConfigured()) {
      logger.log('[AI] 配置未加载，尝试加载...');
      await aiService.loadConfig();
    }

    if (!aiService.isConfigured()) {
      logger.error('[AI] 配置加载后仍然不可用');
      throw new Error('AI 服务未配置，请先在设置中配置');
    }

    try {
      const base64 = await imageToBase64(imageUri);
      logger.log('[AI] 图片 Base64 长度:', base64.length, '字符');

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
      logger.log('[AI] 请求端点:', apiEndpoint);
      logger.log('[AI] API 类型:', config.apiType);
      logger.log('[AI] 模型:', config.model);

      const jsonText = await callVisionApi({
        apiType: config.apiType || 'chat-completions',
        endpoint: apiEndpoint,
        apiKey: config.apiKey,
        model: config.model,
        base64,
        prompt,
        maxTokens: 500,
      });

      const result = JSON.parse(jsonText);
      const exerciseType = this.mapExerciseType(result.exerciseType);

      logger.log('[AI] 分析完成:',
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
        rawText: jsonText,
      };
    } catch (error) {
      logger.error('[AI] 运动截图分析失败:', error);
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
