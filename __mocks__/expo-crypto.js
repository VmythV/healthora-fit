// __mocks__/expo-crypto.js
// 内存版 expo-crypto mock —— 用 Node 内置 crypto

const nodeCrypto = require('crypto');

module.exports = {
  getRandomBytes: jest.fn((length) => {
    return new Uint8Array(nodeCrypto.randomBytes(length));
  }),
  digest: jest.fn(async (algorithm, data) => {
    const algMap = {
      'SHA-256': 'sha256',
      'SHA-384': 'sha384',
      'SHA-512': 'sha512',
      'MD5': 'md5',
    };
    const nodeAlg = algMap[algorithm] || String(algorithm).toLowerCase();
    const buf = nodeCrypto.createHash(nodeAlg).update(data).digest();
    return new Uint8Array(buf);
  }),
  CryptoEncoding: {
    HEX: 'hex',
    BASE64: 'base64',
  },
  DigestAlgorithm: {
    SHA256: 'SHA-256',
    SHA384: 'SHA-384',
    SHA512: 'SHA-512',
    MD5: 'MD5',
  },
};
