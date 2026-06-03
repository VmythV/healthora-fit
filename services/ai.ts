// services/ai.ts
// AI 服务基类

import * as FileSystem from 'expo-file-system';
import { aiConfigQueries } from '@/database/queries/aiConfig';

export interface AiConfig {
  endpoint: string;
  apiKey: string;
  model: string;
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
    const config = await aiConfigQueries.get();
    if (config) {
      this.config = {
        endpoint: config.apiEndpoint || '',
        apiKey: config.apiKey || '',
        model: config.modelName || 'gpt-4-vision-preview',
      };
    }
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
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('AI 服务未配置');
    }

    try {
      const response = await fetch(`${this.config!.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('测试连接失败:', error);
      return false;
    }
  }

  /**
   * 将图片转换为 Base64
   */
  async imageToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('图片转 Base64 失败:', error);
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
      // 转换图片为 Base64
      const base64 = await this.imageToBase64(imageUri);

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

      const response = await fetch(`${this.config!.endpoint}/chat/completions`, {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI 请求失败:', errorText);
        throw new Error('AI 识别失败，请重试');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      // 解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 返回格式错误');
      }

      const result = JSON.parse(jsonMatch[0]);

      // 计算总量
      const foods: FoodItem[] = result.foods || [];
      const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
      const totalProtein = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
      const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
      const totalFat = foods.reduce((sum, f) => sum + (f.fat || 0), 0);

      return {
        foods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    } catch (error) {
      console.error('食物分析失败:', error);
      throw error;
    }
  }
}

export const aiService = AiService.getInstance();
