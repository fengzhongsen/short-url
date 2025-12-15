const CryptoJS = require('crypto-js');

// 加密密钥（从环境变量读取，前后端保持一致）
const ENCRYPT_KEY = process.env.ENCRYPT_KEY || 'short-url-encrypt-key';

/**
 * 加密文本
 * @param {string} text
 * @returns {string} 加密后的文本（Base64编码）
 */
const encrypt = (text) => {
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPT_KEY).toString();
  return encrypted;
};

/**
 * 解密文本
 * @param {string} encrypted
 * @returns {string} 解密后的文本
 */
const decrypt = (encrypted) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPT_KEY);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      throw new Error('解密结果为空');
    }
    return result;
  } catch (err) {
    console.error('Decrypt error:', err);
    throw new Error('解密失败');
  }
};

module.exports = { encrypt, decrypt };
