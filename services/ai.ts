// services/ai.ts
// AI 服务基类

import { logger } from '@/utils/logger';
import { File } from 'expo-file-system';
import { aiConfigQueries } from '@/database/queries/aiConfig';
import { testActiveConfig, TestResult } from './aiConnection';

export interface AiConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  apiType?: 'chat-completions' | 'responses'; // API 类型
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
 *
 * @example
 * ```tsx
 * const aiService = AiService.getInstance();
 *
 * // 分析食物图片
 * const result = await aiService.analyzeFood(imageUri);
 *
 * // 测试连接
 * const isConnected = await aiService.testConnection();
 * ```
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
  private detectApiType(endpoint: string): 'chat-completions' | 'responses' {
    // 如果端点以 /responses 结尾，使用 responses API
    if (endpoint.endsWith('/responses')) {
      return 'responses';
    }
    // 默认使用 chat-completions
    return 'chat-completions';
  }

  /**
   * 获取 API 端点
   */
  getApiEndpoint(): string {
    if (!this.config) return '';
    const { endpoint, apiType } = this.config;
    // 如果端点已经包含完整路径，直接返回
    if (endpoint.endsWith('/chat/completions') || endpoint.endsWith('/responses')) {
      return endpoint;
    }
    // 根据 API 类型添加路径
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
    return !!(
      this.config?.endpoint &&
      this.config?.apiKey
    );
  }

  /**
   * 测试连接
   *
   * P0.4 重构：薄包装，复用 services/aiConnection.testActiveConfig 的实现。
   * 这样 database/queries/aiConfig.ts 和 services/ai.ts 不再各持一份 ~100 行重复代码。
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
   * 将图片转换为 Base64
   */
  async imageToBase64(uri: string): Promise<string> {
    try {
      // 使用新的 File API 读取文件
      const file = new File(uri);
      const base64 = await file.base64();
      return base64;
    } catch (error) {
      logger.error('[AI] 图片转 Base64 失败:', error);
      throw new Error('图片读取失败');
    }
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

      // 转换图片为 Base64
      const base64 = await this.imageToBase64(imageUri);
      logger.log('[AI] 图片 Base64 长度:', base64.length, '字符');

      // 构建请求
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
      let response: Response;

      if (this.config!.apiType === 'responses') {
        // Responses API 格式
        logger.log('[AI] 使用 Responses API 发送请求...');
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config!.model,
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
            max_output_tokens: 1000,
          }),
        });
      } else {
        // Chat Completions API 格式
        logger.log('[AI] 使用 Chat Completions API 发送请求...');
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config!.model,
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
            max_tokens: 1000,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[AI] HTTP 状态:', response.status);
        logger.error('[AI] 响应错误:', errorText);
        throw new Error('AI 识别失败，请重试');
      }

      logger.log('[AI] HTTP 状态:', response.status, 'OK');
      const data = await response.json();
      logger.log('[AI] 原始响应:', JSON.stringify(data).substring(0, 500));

      // 根据 API 类型解析响应
      let content: string | undefined;
      if (this.config!.apiType === 'responses') {
        // Responses API 格式
        content = data.output?.[0]?.content?.[0]?.text || data.choices?.[0]?.message?.content;
      } else {
        // Chat Completions API 格式
        content = data.choices?.[0]?.message?.content;
      }

      logger.log('[AI] 解析出的内容:', content ? content.substring(0, 300) : '(空)');

      if (!content) {
        logger.error('[AI] 返回内容为空，完整响应:', JSON.stringify(data));
        throw new Error('AI 返回内容为空');
      }

      // 解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.error('[AI] 未找到 JSON，原始内容:', content);
        throw new Error('AI 返回格式错误');
      }

      logger.log('[AI] JSON 匹配:', jsonMatch[0].substring(0, 300));
      const result = JSON.parse(jsonMatch[0]);
      logger.log('[AI] 解析结果:', JSON.stringify(result));

      // 计算总量
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

      return {
        foods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    } catch (error) {
      logger.error('[AI] 食物分析失败:', error);
      throw error;
    }
  }
}

export const aiService = AiService.getInstance();
