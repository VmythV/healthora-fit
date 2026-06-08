// services/ai.ts
// AI 服务基类
//
// P1-6：analyzeFood 重构，复用 services/vision/baseVisionClient 的 imageToBase64 + callVisionApi
// 减少与 services/exerciseAnalysis.ts 的代码重复

import { logger } from '@/utils/logger';
import { aiConfigQueries } from '@/database/queries/aiConfig';
import { testActiveConfig, TestResult } from './aiConnection';
import {
  imageToBase64,
  callVisionApi,
  ApiType,
} from './vision/baseVisionClient';

export interface AiConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  apiType?: ApiType;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

/**
 * AI 服务类
 */
export class AiService {
  private static instance: AiService;
  private config: AiConfig | null = null;

  private constructor() {}

  static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  /**
   * 加载配置
   */
  async loadConfig(): Promise<void> {
    logger.log('[AI] 正在加载配置...');
    const config = await aiConfigQueries.getActive();
    if (config) {
      this.config = {
        endpoint: config.apiEndpoint || '',
        apiKey: config.apiKey || '',
        model: config.modelName || 'gpt-4-vision-preview',
        apiType: this.detectApiType(config.apiEndpoint || ''),
      };
      logger.log('[AI] 配置已加载:', {
        endpoint: this.config.endpoint,
        model: this.config.model,
        apiType: this.config.apiType,
        hasKey: !!this.config.apiKey,
      });
    } else {
      logger.log('[AI] 未找到活跃配置');
    }
  }

  /**
   * 检测 API 类型
   */
  private detectApiType(endpoint: string): ApiType {
    return endpoint.endsWith('/responses') ? 'responses' : 'chat-completions';
  }

  /**
   * 获取 API 端点
   */
  getApiEndpoint(): string {
    if (!this.config) return '';
    const { endpoint, apiType } = this.config;
    if (endpoint.endsWith('/chat/completions') || endpoint.endsWith('/responses')) {
      return endpoint;
    }
    if (apiType === 'responses') {
      return `${endpoint}/responses`;
    }
    return `${endpoint}/chat/completions`;
  }

  /**
   * 获取配置
   */
  getConfig(): AiConfig | null {
    return this.config;
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!(this.config?.endpoint && this.config?.apiKey);
  }

  /**
   * 测试连接（薄包装，共享 services/aiConnection.testActiveConfig 的实现）
   */
  async testConnection(): Promise<TestResult> {
    if (!this.config) {
      await this.loadConfig();
    }
    if (!this.isConfigured()) {
      return { success: false, error: 'AI 服务未配置' };
    }
    return testActiveConfig({
      endpoint: this.config!.endpoint,
      apiKey: this.config!.apiKey,
      model: this.config!.model,
      apiType: this.config!.apiType,
    });
  }

  /**
   * 将图片转换为 Base64（薄包装，调用 services/vision/baseVisionClient）
   *
   * 保留方法签名以兼容旧调用方（如有）。
   */
  async imageToBase64(uri: string): Promise<string> {
    return imageToBase64(uri);
  }

  /**
   * 分析食物图片
   */
  async analyzeFood(imageUri: string): Promise<AnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('AI 服务未配置，请先在设置中配置');
    }

    try {
      logger.log('[AI] 开始分析食物图片');
      logger.log('[AI] 图片 URI:', imageUri);

      const base64 = await imageToBase64(imageUri);
      logger.log('[AI] 图片 Base64 长度:', base64.length, '字符');

      const prompt = `请分析这张食物图片，识别出所有食物并估算营养成分。

请以 JSON 格式返回，格式如下：
{
  "foods": [
    {
      "name": "食物名称",
      "portion": "份量描述（如：1碗、100g）",
      "calories": 卡路里数值,
      "protein": 蛋白质克数,
      "carbs": 碳水化合物克数,
      "fat": 脂肪克数
    }
  ]
}

注意：
1. 请尽可能准确估算
2. 如果无法确定具体数值，给出合理估计
3. 只返回 JSON，不要有其他文字`;

      const apiEndpoint = this.getApiEndpoint();
      logger.log('[AI] 请求端点:', apiEndpoint);
      logger.log('[AI] API 类型:', this.config!.apiType);
      logger.log('[AI] 模型:', this.config!.model);

      const jsonText = await callVisionApi({
        apiType: this.config!.apiType || 'chat-completions',
        endpoint: apiEndpoint,
        apiKey: this.config!.apiKey,
        model: this.config!.model,
        base64,
        prompt,
        maxTokens: 1000,
      });

      const result = JSON.parse(jsonText);
      const foods: FoodItem[] = result.foods || [];
      const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
      const totalProtein = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
      const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
      const totalFat = foods.reduce((sum, f) => sum + (f.fat || 0), 0);

      logger.log('[AI] 分析完成:',
        `${foods.length} 种食物,`,
        `${totalCalories} kcal,`,
        `蛋白质 ${totalProtein}g,`,
        `碳水 ${totalCarbs}g,`,
        `脂肪 ${totalFat}g`
      );

      return { foods, totalCalories, totalProtein, totalCarbs, totalFat };
    } catch (error) {
      logger.error('[AI] 食物分析失败:', error);
      throw error;
    }
  }
}

export const aiService = AiService.getInstance();
