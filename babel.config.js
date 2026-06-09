// babel.config.js
// Expo SDK 54 + Reanimated 4 + Worklets 0.5 标准配置
//
// 修复：之前 d4bd9be commit 误删了此文件，导致 Reanimated 在运行时找不到
// plugin，启动抛错后 app 卡在白屏转圈。
//
// 关键点：
// 1. 用 babel-preset-expo（SDK 54 自带，不需额外配 stage 等）
// 2. reanimated 4 配合 react-native-worklets 0.5，plugin 路径变了
// 3. plugin 必须放在 presets 之后
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  }
}
