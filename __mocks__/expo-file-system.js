// __mocks__/expo-file-system.js
// 最小版 expo-file-system mock —— File 类 + Paths 单例

class File {
  constructor(path) {
    this._path = String(path);
  }
  // 兼容 File API（expo-file-system 19.x）
  get uri() {
    return this._path;
  }
  text = jest.fn(async () => '');
  base64 = jest.fn(async () => '');
  write = jest.fn(() => undefined);
  create = jest.fn(() => undefined);
}

const Paths = {
  document: '/tmp/document',
  cache: '/tmp/cache',
};

module.exports = { File, Paths };
module.exports.default = { File, Paths };
