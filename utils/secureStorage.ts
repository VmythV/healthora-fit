// utils/secureStorage.ts
// API Key 加密存储（SecureStore-first 双层防御）
//
// 设计思路：
// - 整段 api_key 存到 SecureStore（系统 Keychain/Keystore + AES-GCM，硬件级保护）
// - DB 的 ai_config.api_key 列只存一个本地句柄（handle）
// - 通过 ai_config.is_encrypted 区分新旧数据
//
// 加解密调用方：
// - aiConfigQueries.save/update：写入前 secureStoreApiKey(plain) 拿 handle
// - aiConfigQueries.getActive/getAll：读取时 readApiKey(handle) 反查明文
//
// 历史明文数据（is_encrypted=0）直接返回，调用方按用户决定不迁移。

import * as SecureStore from 'expo-secure-store';
import { getRandomBytes } from 'expo-crypto';
import { logger } from '@/utils/logger';

const HANDLE_PREFIX = 'ai_key_';

/**
 * 生成 SecureStore 句柄。
 * 格式：ai_key_<timestamp>_<base36(rand)>
 * 不含敏感信息，可以安全写进 DB。
 */
function generateHandle(): string {
  const ts = Date.now().toString(36);
  const rand = getRandomBytes(6);
  // 转 base36 缩短长度
  let randStr = '';
  for (let i = 0; i < rand.length; i++) {
    randStr += (rand[i] ?? 0).toString(36).padStart(2, '0');
  }
  return `${HANDLE_PREFIX}${ts}_${randStr}`;
}

/**
 * 检查 SecureStore 是否可用
 */
export async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * 把 api_key 明文写入 SecureStore，返回一个句柄。
 *
 * 失败时抛出错误（让调用方决定是否降级到明文）。
 */
export async function secureStoreApiKey(plaintext: string): Promise<string> {
  const handle = generateHandle();
  await SecureStore.setItemAsync(handle, plaintext, {
    requireAuthentication: false,
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
  return handle;
}

/**
 * 通过句柄从 SecureStore 读取明文 api_key。
 *
 * 句柄不存在或读取失败时返回空字符串（不抛），调用方按 UI 错误处理。
 */
export async function readApiKey(handle: string): Promise<string> {
  if (!handle) return '';
  try {
    const value = await SecureStore.getItemAsync(handle);
    return value ?? '';
  } catch (err) {
    logger.error('[secureStorage] readApiKey 失败:', err);
    return '';
  }
}

/**
 * 删除 SecureStore 中的 api_key。
 * 用于配置删除/覆盖场景。
 */
export async function deleteApiKey(handle: string): Promise<void> {
  if (!handle) return;
  try {
    await SecureStore.deleteItemAsync(handle);
  } catch (err) {
    // 删除失败只记 log，不阻塞主流程
    logger.warn('[secureStorage] deleteApiKey 失败:', err);
  }
}

/**
 * 判断一个 api_key 字段值是否为 SecureStore 句柄。
 * 历史明文数据是任意字符串，新建的全部以 "ai_key_" 开头。
 */
export function isSecureHandle(value: string | null | undefined): boolean {
  return !!value && value.startsWith(HANDLE_PREFIX);
}
