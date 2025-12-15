const { redis, redisKey } = require('../redis');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;
const MAX_RETRIES = 10;

/**
 * 生成随机短链码
 * @param {number} length 长度
 * @returns {string} 随机短链码
 */
const generateRandomCode = (length = CODE_LENGTH) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return code;
};

/**
 * 生成唯一短链码（带碰撞检测）
 * @param {number} maxRetries 最大重试次数
 * @returns {Promise<string>} 唯一的短链码
 */
const generateUniqueCode = async (maxRetries = MAX_RETRIES) => {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateRandomCode();
    // 检查是否已存在
    const exists = await redis.hExists(redisKey.map, code);
    if (!exists) {
      return code;
    }
    // 如果碰撞，继续重试
    console.log(`Code collision detected: ${code}, retrying...`);
  }
  // 如果重试多次仍失败，使用更长的长度
  return generateRandomCode(CODE_LENGTH + 2);
};

module.exports = {
  generateRandomCode,
  generateUniqueCode,
};
