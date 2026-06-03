// constants/i18n.ts
// 国际化配置

import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

// 创建 i18n 实例
const i18n = new I18n({
  'zh-CN': zhCN,
  en: en,
});

// 设置默认语言
i18n.defaultLocale = 'zh-CN';
i18n.enableFallback = true;

// 获取设备语言
const deviceLocale = Localization.locale;

// 设置当前语言（从设备语言推断）
if (deviceLocale.startsWith('zh')) {
  i18n.locale = 'zh-CN';
} else {
  i18n.locale = 'en';
}

// 支持的语言列表
export const SUPPORTED_LOCALES = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number]['code'];

// 获取当前语言
export function getCurrentLocale(): Locale {
  return i18n.locale as Locale;
}

// 设置语言
export function setLocale(locale: Locale): void {
  i18n.locale = locale;
}

// 翻译函数
export function t(key: string, params?: Record<string, any>): string {
  return i18n.t(key, params);
}

// 导出 i18n 实例
export { i18n };
