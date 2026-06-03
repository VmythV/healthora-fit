// stores/aiStore.ts
// AI 服务状态

import { create } from 'zustand';
import { aiConfigQueries } from '@/database/queries';
import { AIConfig } from '@/types/ai';

interface AIState {
  // 配置
  config: AIConfig | null;

  // 分析状态
  isAnalyzing: boolean;
  analysisProgress: number;

  // 错误
  error: string | null;

  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: (config: {
    apiEndpoint: string;
    apiKey: string;
    modelName: string;
  }) => Promise<void>;
  testConnection: () => Promise<boolean>;
  setAnalyzing: (isAnalyzing: boolean, progress?: number) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * AI 服务状态 Store
 *
 * @example
 * ```tsx
 * const { config, loadConfig, saveConfig, testConnection } = useAIStore();
 *
 * useEffect(() => {
 *   loadConfig();
 * }, []);
 *
 * // 保存配置
 * await saveConfig({
 *   apiEndpoint: 'https://api.openai.com/v1',
 *   apiKey: 'sk-...',
 *   modelName: 'gpt-4o',
 * });
 *
 * // 测试连接
 * const isConnected = await testConnection();
 * ```
 */
export const useAIStore = create<AIState>((set, get) => ({
  // 初始状态
  config: null,
  isAnalyzing: false,
  analysisProgress: 0,
  error: null,

  // 加载配置
  loadConfig: async () => {
    try {
      set({ error: null });
      const config = await aiConfigQueries.getActive();
      set({ config });
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载 AI 配置失败';
      set({ error: message });
      console.error('[aiStore] loadConfig 失败:', err);
    }
  },

  // 保存配置
  saveConfig: async (configData) => {
    try {
      set({ error: null });
      await aiConfigQueries.save(configData);

      // 重新加载配置
      const config = await aiConfigQueries.getActive();
      set({ config });
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存 AI 配置失败';
      set({ error: message });
      console.error('[aiStore] saveConfig 失败:', err);
      throw err;
    }
  },

  // 测试连接
  testConnection: async () => {
    try {
      set({ error: null });
      const isConnected = await aiConfigQueries.testConnection();
      return isConnected;
    } catch (err) {
      const message = err instanceof Error ? err.message : '测试连接失败';
      set({ error: message });
      console.error('[aiStore] testConnection 失败:', err);
      return false;
    }
  },

  // 设置分析状态
  setAnalyzing: (isAnalyzing, progress = 0) =>
    set({ isAnalyzing, analysisProgress: progress }),

  // 设置错误
  setError: (error) =>
    set({ error }),

  // 清除错误
  clearError: () =>
    set({ error: null }),
}));
