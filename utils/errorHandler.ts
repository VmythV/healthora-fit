// utils/errorHandler.ts
// 统一错误处理工具

import { Alert } from 'react-native';

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'PERMISSION_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: Date;
}

/**
 * 创建应用错误
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: string
): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date(),
  };
}

/**
 * 处理数据库错误
 */
export function handleDatabaseError(error: unknown): AppError {
  console.error('[Database Error]', error);

  const message = error instanceof Error ? error.message : '数据库操作失败';
  return createError('DATABASE_ERROR', '数据库操作失败', message);
}

/**
 * 处理网络错误
 */
export function handleNetworkError(error: unknown): AppError {
  console.error('[Network Error]', error);

  const message = error instanceof Error ? error.message : '网络连接失败';
  return createError('NETWORK_ERROR', '网络连接失败，请检查网络设置', message);
}

/**
 * 处理 AI 服务错误
 */
export function handleAIServiceError(error: unknown): AppError {
  console.error('[AI Service Error]', error);

  const message = error instanceof Error ? error.message : 'AI 服务请求失败';
  return createError('AI_SERVICE_ERROR', 'AI 识别失败，请重试或手动输入', message);
}

/**
 * 处理权限错误
 */
export function handlePermissionError(error: unknown): AppError {
  console.error('[Permission Error]', error);

  const message = error instanceof Error ? error.message : '权限请求失败';
  return createError('PERMISSION_ERROR', '需要权限才能使用此功能', message);
}

/**
 * 处理验证错误
 */
export function handleValidationError(message: string): AppError {
  console.warn('[Validation Error]', message);

  return createError('VALIDATION_ERROR', message);
}

/**
 * 处理未知错误
 */
export function handleUnknownError(error: unknown): AppError {
  console.error('[Unknown Error]', error);

  const message = error instanceof Error ? error.message : '发生未知错误';
  return createError('UNKNOWN_ERROR', '操作失败，请稍后重试', message);
}

/**
 * 显示错误提示
 */
export function showErrorAlert(error: AppError, onRetry?: () => void): void {
  const buttons = [
    { text: '确定', style: 'cancel' as const },
  ];

  if (onRetry) {
    buttons.push({
      text: '重试',
      onPress: onRetry,
    });
  }

  Alert.alert('错误', error.message, buttons);
}

/**
 * 统一错误处理
 */
export function handleError(
  error: unknown,
  context: string,
  options?: {
    showAlert?: boolean;
    onRetry?: () => void;
    fallbackMessage?: string;
  }
): AppError {
  let appError: AppError;

  // 根据错误类型分类处理
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      appError = handleNetworkError(error);
    } else if (error.message.includes('database') || error.message.includes('SQLITE')) {
      appError = handleDatabaseError(error);
    } else if (error.message.includes('AI') || error.message.includes('api')) {
      appError = handleAIServiceError(error);
    } else if (error.message.includes('permission')) {
      appError = handlePermissionError(error);
    } else {
      appError = handleUnknownError(error);
    }
  } else {
    appError = handleUnknownError(error);
  }

  // 记录上下文
  console.error(`[${context}]`, appError);

  // 显示错误提示
  if (options?.showAlert !== false) {
    showErrorAlert(appError, options?.onRetry);
  }

  return appError;
}
