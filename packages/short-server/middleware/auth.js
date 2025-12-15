const { redis } = require('../redis');
const { verifyToken } = require('../utils/jwt');

/**
 * 鉴权中间件：校验 Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: '未提供 token' });
    }

    // 校验 JWT
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ error: '无效 token' });
    }

    // 确认 token 在 Redis 中存在（支持服务端撤销/过期控制）
    let owner = await redis.get(`short-url:token:${token}`);

    // 如果普通 token 不存在，尝试查找 API Key
    if (!owner) {
      owner = await redis.get(`short-url:apikey:${token}`);
    }

    if (!owner) {
      return res.status(401).json({ error: 'Token 无效或已过期' });
    }

    req.user = payload;
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = authMiddleware;
