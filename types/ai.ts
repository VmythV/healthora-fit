// AI 配置相关类型

export interface AIConfig {
  id: number;
  apiEndpoint: string;
  apiKey: string;
  modelName: string;
  isActive: boolean;
  /**
   * P0.1：apiKey 是否已迁移到 SecureStore（0/1 → boolean）。
   * 历史明文数据为 false；新增/更新的加密数据为 true。
   */
  isEncrypted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
