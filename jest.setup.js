// jest.setup.js
// 全局 mock 与官方 setup 挂载点
// 注意：jest-expo 的 setup 由 preset 内部已注入，无需重复

// React Native Reanimated 官方 mock
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// React Native Gesture Handler 官方 setup
require('react-native-gesture-handler/jestSetup');

// AsyncStorage 官方 jest mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 自定义 mock —— 用 __mocks__/ 目录的自动 mock（jest 会查找根目录 __mocks__/<name>.js）
jest.mock('expo-secure-store');
jest.mock('expo-crypto');
jest.mock('expo-file-system');
jest.mock('expo-sqlite');
jest.mock('expo-localization');

// 关闭原生模块的 console 噪音
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});
