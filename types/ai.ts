// AI 配置相关类型

export interface AIConfig {
  id: number;
  apiEndpoint: string;
  apiKey: string;
  modelName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
