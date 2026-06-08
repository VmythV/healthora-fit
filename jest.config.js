// jest.config.js
// jest-expo 最小测试配置
// 覆盖：单元测试（utils / services / queries / hooks）

module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  // 路径别名必须与 tsconfig.json 同步
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@stores/(.*)$': '<rootDir>/stores/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/__mocks__/'],
};
