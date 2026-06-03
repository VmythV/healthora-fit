// utils/validation.ts
// 数据验证工具

/**
 * 验证体重值
 */
export function validateWeight(weight: number | string): {
  valid: boolean;
  error?: string;
} {
  const num = typeof weight === 'string' ? parseFloat(weight) : weight;

  if (isNaN(num)) {
    return { valid: false, error: '请输入有效的数字' };
  }

  if (num < 20) {
    return { valid: false, error: '体重不能低于 20 kg' };
  }

  if (num > 300) {
    return { valid: false, error: '体重不能超过 300 kg' };
  }

  return { valid: true };
}

/**
 * 验证卡路里值
 */
export function validateCalories(calories: number | string): {
  valid: boolean;
  error?: string;
} {
  const num = typeof calories === 'string' ? parseFloat(calories) : calories;

  if (isNaN(num)) {
    return { valid: false, error: '请输入有效的数字' };
  }

  if (num < 0) {
    return { valid: false, error: '卡路里不能为负数' };
  }

  if (num > 10000) {
    return { valid: false, error: '卡路里值异常，请检查' };
  }

  return { valid: true };
}

/**
 * 验证运动时长
 */
export function validateDuration(duration: number | string): {
  valid: boolean;
  error?: string;
} {
  const num = typeof duration === 'string' ? parseFloat(duration) : duration;

  if (isNaN(num)) {
    return { valid: false, error: '请输入有效的数字' };
  }

  if (num <= 0) {
    return { valid: false, error: '运动时长必须大于 0' };
  }

  if (num > 1440) {
    return { valid: false, error: '运动时长不能超过 24 小时' };
  }

  return { valid: true };
}

/**
 * 验证日期字符串
 */
export function validateDate(date: string): {
  valid: boolean;
  error?: string;
} {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(date)) {
    return { valid: false, error: '日期格式不正确' };
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return { valid: false, error: '无效的日期' };
  }

  return { valid: true };
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱格式不正确' };
  }

  return { valid: true };
}

/**
 * 验证 API 端点
 */
export function validateApiEndpoint(endpoint: string): {
  valid: boolean;
  error?: string;
} {
  if (!endpoint.trim()) {
    return { valid: false, error: '请输入 API 地址' };
  }

  try {
    new URL(endpoint);
    return { valid: true };
  } catch {
    return { valid: false, error: 'API 地址格式不正确' };
  }
}

/**
 * 验证非空字符串
 */
export function validateRequired(value: string, fieldName: string): {
  valid: boolean;
  error?: string;
} {
  if (!value.trim()) {
    return { valid: false, error: `请输入${fieldName}` };
  }

  return { valid: true };
}

/**
 * 验证字符串长度
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): {
  valid: boolean;
  error?: string;
} {
  if (value.length < min) {
    return { valid: false, error: `${fieldName}长度不能少于 ${min} 个字符` };
  }

  if (value.length > max) {
    return { valid: false, error: `${fieldName}长度不能超过 ${max} 个字符` };
  }

  return { valid: true };
}

/**
 * 清理和格式化数字输入
 */
export function sanitizeNumberInput(input: string): string {
  // 只允许数字和小数点
  let cleaned = input.replace(/[^0-9.]/g, '');

  // 确保只有一个小数点
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // 限制小数位数
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }

  return cleaned;
}

/**
 * 格式化日期为 ISO 格式
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 格式化时间为本地格式
 */
export function formatTimeToLocal(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 检查是否为今天
 */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr.startsWith(today);
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
