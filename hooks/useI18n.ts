// hooks/useI18n.ts
// 国际化 Hook

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, setLocale, getCurrentLocale, Locale, SUPPORTED_LOCALES } from '@/constants/i18n';

const LANGUAGE_STORAGE_KEY = '@healthora_language';

interface UseI18nReturn {
  locale: Locale;
  t: typeof t;
  setLocale: (locale: Locale) => Promise<void>;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

/**
 * 国际化 Hook
 *
 * @example
 * ```tsx
 * const { t, locale, setLocale, supportedLocales } = useI18n();
 *
 * return (
 *   <View>
 *     <Text>{t('home.title')}</Text>
 *     <Button onPress={() => setLocale('en')}>English</Button>
 *   </View>
 * );
 * ```
 */
export function useI18n(): UseI18nReturn {
  const [locale, setCurrentLocale] = useState<Locale>(getCurrentLocale());

  // 初始化：从存储加载语言设置
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLocale && isSupportedLocale(savedLocale)) {
        setLocale(savedLocale);
        setCurrentLocale(savedLocale);
      }
    } catch (error) {
      console.error('[useI18n] 加载语言设置失败:', error);
    }
  };

  const isSupportedLocale = (locale: string): locale is Locale => {
    return SUPPORTED_LOCALES.some((l) => l.code === locale);
  };

  const handleSetLocale = useCallback(async (newLocale: Locale) => {
    try {
      // 保存到存储
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);

      // 更新 i18n
      setLocale(newLocale);

      // 更新状态
      setCurrentLocale(newLocale);
    } catch (error) {
      console.error('[useI18n] 保存语言设置失败:', error);
    }
  }, []);

  return {
    locale,
    t,
    setLocale: handleSetLocale,
    supportedLocales: SUPPORTED_LOCALES,
  };
}
