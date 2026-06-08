// stores/appStore.ts
// 应用全局状态
//
// P1-13：删除 locale 字段和 setLocale action（死代码 + 与 P1-13 i18n useSyncExternalStore 重叠）
// 已有 grep 验证 useAppStore 0 消费方，删除安全。

import { create } from 'zustand';

interface AppState {
  // 加载状态
  isLoading: boolean;
  loadingMessage: string | null;

  // 当前 Tab
  currentTab: string;

  // 主题
  theme: 'light' | 'dark' | 'system';

  // 首次启动
  isFirstLaunch: boolean;

  // Actions
  setLoading: (isLoading: boolean, message?: string) => void;
  setCurrentTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFirstLaunch: (isFirst: boolean) => void;
}

/**
 * 应用全局状态 Store
 */
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  isLoading: false,
  loadingMessage: null,
  currentTab: 'home',
  theme: 'system',
  isFirstLaunch: true,

  // Actions
  setLoading: (isLoading, message = null) =>
    set({ isLoading, loadingMessage: message }),

  setCurrentTab: (currentTab) =>
    set({ currentTab }),

  setTheme: (theme) =>
    set({ theme }),

  setFirstLaunch: (isFirstLaunch) =>
    set({ isFirstLaunch }),
}));
