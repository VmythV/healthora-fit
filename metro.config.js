// metro.config.js
// Expo SDK 54 Metro 配置
// 用 getDefaultConfig 继承 Expo 默认行为
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

module.exports = config
