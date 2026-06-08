// __mocks__/expo-secure-store.js
// 内存版 SecureStore mock —— 用 Map 模拟 Keychain/Keystore

const store = new Map();

module.exports = {
  getItemAsync: jest.fn(async (key) => store.get(key) ?? null),
  setItemAsync: jest.fn(async (key, value) => {
    store.set(key, String(value));
  }),
  deleteItemAsync: jest.fn(async (key) => {
    store.delete(key);
  }),
  isAvailableAsync: jest.fn(async () => true),
  // 暴露测试辅助方法
  __reset: () => store.clear(),
  __getAll: () => new Map(store),
};
