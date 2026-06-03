// stores/appStore.ts
// 应用全局状态

import { create } from 'zustand';
import { Locale } from '@/constants/i18n';

interface AppState {
  // 加载状态
  isLoading: boolean;
  loadingMessage: string | null;

  // 当前 Tab
  currentTab: string;

  // 主题
  theme: 'light' | 'dark' | 'system';

  // 语言
  locale: Locale;

  // 首次启动
  isFirstLaunch: boolean;

  // Actions
  setLoading: (isLoading: boolean, message?: string) => void;
  setCurrentTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: Locale) => void;
  setFirstLaunch: (isFirst: boolean) => void;
}

/**
 * 应用全局状态 Store
 *
 * @example
 * ```tsx
 * const { isLoading, setLoading, currentTab, setCurrentTab } = useAppStore();
 *
 * // 显示加载
 * setLoading(true, '加载中...');
 *
 * // 切换 Tab
 * setCurrentTab('home');
 * ```
 */
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  isLoading: false,
  loadingMessage: null,
  currentTab: 'home',
  theme: 'system',
  locale: 'zh-CN',
  isFirstLaunch: true,

  // Actions
  setLoading: (isLoading, message = null) =>
    set({ isLoading, loadingMessage: message }),

  setCurrentTab: (currentTab) =>
    set({ currentTab }),

  setTheme: (theme) =>
    set({ theme }),

  setLocale: (locale) =>
    set({ locale }),

  setFirstLaunch: (isFirstLaunch) =>
    set({ isFirstLaunch }),
}));
