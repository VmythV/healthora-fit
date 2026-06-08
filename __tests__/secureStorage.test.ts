// __tests__/secureStorage.test.ts
// 覆盖：secureStorage 加解密 round-trip；不同 plaintext 产生不同 handle；明文不在 handle 字面值

import * as SecureStore from 'expo-secure-store';
import {
  secureStoreApiKey,
  readApiKey,
  deleteApiKey,
  isSecureHandle,
  isSecureStoreAvailable,
} from '../utils/secureStorage';

describe('utils/secureStorage', () => {
  beforeEach(() => {
    (SecureStore as any).__reset();
  });

  it('secureStoreApiKey + readApiKey round-trip', async () => {
    const handle = await secureStoreApiKey('sk-abc-1234567890');
    expect(handle).toMatch(/^ai_key_/);

    const value = await readApiKey(handle);
    expect(value).toBe('sk-abc-1234567890');
  });

  it('不同 plaintext 产生不同 handle', async () => {
    const h1 = await secureStoreApiKey('sk-key-A');
    const h2 = await secureStoreApiKey('sk-key-B');
    expect(h1).not.toBe(h2);
  });

  it('明文不直接出现在 handle 字面值里', async () => {
    const plaintext = 'sk-very-secret-key-12345';
    const handle = await secureStoreApiKey(plaintext);
    expect(handle.includes(plaintext)).toBe(false);
    expect(handle.includes('sk-')).toBe(false);
  });

  it('readApiKey(不存在) 返回空字符串而非抛错', async () => {
    const value = await readApiKey('non-existent-handle');
    expect(value).toBe('');
  });

  it('isSecureHandle 正确识别句柄', () => {
    expect(isSecureHandle('ai_key_xxx_yyy')).toBe(true);
    expect(isSecureHandle('sk-plaintext')).toBe(false);
    expect(isSecureHandle('')).toBe(false);
    expect(isSecureHandle(null)).toBe(false);
    expect(isSecureHandle(undefined)).toBe(false);
  });

  it('deleteApiKey 后 readApiKey 返回空', async () => {
    const handle = await secureStoreApiKey('sk-xyz');
    await deleteApiKey(handle);
    const value = await readApiKey(handle);
    expect(value).toBe('');
  });

  it('isSecureStoreAvailable 返回 true（mock 模拟可用）', async () => {
    const available = await isSecureStoreAvailable();
    expect(available).toBe(true);
  });
});
