const { redis } = require('../redis');
const { verifyToken } = require('../utils/jwt');
const response = require('../utils/response');
const { ErrorCode, HttpStatus } = response;

/**
 * 鉴权中间件：校验 Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return response.error(res, ErrorCode.TOKEN_INVALID, '未提供 token', HttpStatus.UNAUTHORIZED);
    }

    // 校验 JWT
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return response.error(res, ErrorCode.TOKEN_INVALID, '无效 token', HttpStatus.UNAUTHORIZED);
    }

    // 确认 token 在 Redis 中存在（支持服务端撤销/过期控制）
    let owner = await redis.get(`short-url:token:${token}`);

    // 如果普通 token 不存在，尝试查找 API Key
    if (!owner) {
      owner = await redis.get(`short-url:apikey:${token}`);
    }

    if (!owner) {
      return response.error(
        res,
        ErrorCode.TOKEN_EXPIRED,
        'Token 无效或已过期',
        HttpStatus.UNAUTHORIZED
      );
    }

    req.user = payload;
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return response.error(
      res,
      ErrorCode.SERVER_ERROR,
      '服务器错误',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = authMiddleware;
