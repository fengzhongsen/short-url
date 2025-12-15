const CryptoJS = require('crypto-js');

// 加密密钥（从环境变量读取，前后端保持一致）
const ENCRYPT_KEY = process.env.ENCRYPT_KEY || 'short-url-encrypt-key';

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

/**
 * 解密密码
 * @param {string} password 加密的密码
 * @returns {string} 解密后的密码
 */
const decryptPassword = (password) => {
  try {
    return decrypt(password);
  } catch (err) {
    throw new Error('密码解密失败');
  }
};

/**
 * 验证用户名和密码格式
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Object} 验证结果
 */
const validateCredentials = (username, password) => {
  if (username.length < 3) {
    return { valid: false, error: '用户名长度至少为 3 位' };
  }
  if (password.length < 6) {
    return { valid: false, error: '密码长度至少为 6 位' };
  }
  return { valid: true };
};

module.exports = {
  decryptPassword,
  validateCredentials,
};
