const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'short-url-jwt-secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';

/**
 * 生成 JWT Token
 * @param {Object} payload 载荷
 * @returns {string} Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

/**
 * 生成永久有效的 JWT Token
 * @param {Object} payload 载荷
 * @returns {string} Token
 */
const generatePermanentToken = (payload) => {
  return jwt.sign(payload, jwtSecret);
};

/**
 * 验证 JWT Token
 * @param {string} token
 * @returns {Object} payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  generateToken,
  generatePermanentToken,
  verifyToken,
};
