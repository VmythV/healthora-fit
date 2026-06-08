// hooks/useI18n.ts
// 国际化 Hook
//
// P1-13：用 useSyncExternalStore 替换 useState(getCurrentLocale())
// 让 34 个 useI18n 调用方共享同一份 locale 状态，
// 切语言时所有组件同步 re-render，不依赖被动 re-render

import { logger } from '@/utils/logger';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  t,
  setLocale,
  subscribe,
  getSnapshot,
  getServerSnapshot,
  Locale,
  SUPPORTED_LOCALES,
} from '@/constants/i18n';

const LANGUAGE_STORAGE_KEY = '@healthora_language';

interface UseI18nReturn {
  locale: Locale;
  t: typeof t;
  setLocale: (locale: Locale) => Promise<void>;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

/**
 * 国际化 Hook
 */
export function useI18n(): UseI18nReturn {
  // P1-13：用 useSyncExternalStore 订阅 i18n 全局 locale
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // 初始化：从存储加载语言设置
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLocale && isSupportedLocale(savedLocale)) {
        setLocale(savedLocale);
      }
    } catch (error) {
      logger.error('[useI18n] 加载语言设置失败:', error);
    }
  };

  const isSupportedLocale = (locale: string): locale is Locale => {
    return SUPPORTED_LOCALES.some((l) => l.code === locale);
  };

  const handleSetLocale = useCallback(async (newLocale: Locale) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
      setLocale(newLocale);
    } catch (error) {
      logger.error('[useI18n] 保存语言设置失败:', error);
    }
  }, []);

  return {
    locale,
    t,
    setLocale: handleSetLocale,
    supportedLocales: SUPPORTED_LOCALES,
  };
}
