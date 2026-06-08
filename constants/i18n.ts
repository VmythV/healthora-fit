// constants/i18n.ts
// 国际化配置
//
// P1-13：加 subscribe / getSnapshot / getServerSnapshot 通知机制
// 让 useI18n 用 useSyncExternalStore 实现跨实例同步：
// - 切语言时所有调用方同步 re-render
// - 不依赖被动 re-render

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

// 获取设备语言（可能为 undefined，需要空值检查）
const deviceLocale = Localization.locale ?? 'zh-CN';

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

// P1-13：订阅机制 —— 切语言时通知所有 useSyncExternalStore 订阅者
type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

function notify(): void {
  subscribers.forEach((fn) => fn());
}

/** 订阅 locale 变化（用于 useSyncExternalStore） */
export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** 当前 locale 的快照（用于 useSyncExternalStore） */
export function getSnapshot(): Locale {
  return i18n.locale as Locale;
}

/** SSR 快照（用于 useSyncExternalStore，hydration 时使用） */
export function getServerSnapshot(): Locale {
  return 'zh-CN';
}

// 获取当前语言
export function getCurrentLocale(): Locale {
  return i18n.locale as Locale;
}

// 设置语言：写 i18n 全局 + 通知订阅者
export function setLocale(locale: Locale): void {
  if (i18n.locale === locale) return;  // 防重复通知
  i18n.locale = locale;
  notify();
}

// 翻译函数
export function t(key: string, params?: Record<string, any>): string {
  return i18n.t(key, params);
}

// 导出 i18n 实例
export { i18n };
