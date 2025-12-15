const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { redis, redisKey } = require('../redis');
const authMiddleware = require('../middleware/auth');
const { decryptPassword, validateCredentials } = require('../utils/pwd');
const { generateToken, generatePermanentToken } = require('../utils/jwt');
const { generateUniqueCode } = require('../utils/short');

const USER_URL_LIMIT = process.env.USER_URL_LIMIT || 10;

// ==================== 认证相关路由 ====================

// 注册接口
router.post('/api/register', async (req, res) => {
  try {
    const { username, password: encryptedPassword } = req.body || {};
    if (!username || !encryptedPassword) return res.status(400).json({ error: '缺少用户名或密码' });

    // 只解密密码，用户名明文传输
    let password;
    try {
      password = decryptPassword(encryptedPassword);
    } catch (err) {
      console.error('Decrypt error:', err);
      return res.status(400).json({ error: '密码格式错误' });
    }

    // 验证用户名和密码格式
    const validation = validateCredentials(username, password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 检查用户是否已存在
    const exists = await redis.hExists(redisKey.users, username);
    if (exists) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 使用 bcrypt hash 密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 存入 Redis
    await redis.hSet(redisKey.users, username, hashedPassword);

    // 初始化用户链接限制
    await redis.set(`short-url:user:${username}:limit`, USER_URL_LIMIT);

    res.json({ message: '注册成功' });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登录接口
router.post('/api/login', async (req, res) => {
  try {
    const { username, password: encryptedPassword } = req.body || {};
    if (!username || !encryptedPassword) return res.status(400).json({ error: '缺少用户名或密码' });

    // 只解密密码，用户名明文传输
    let password;
    try {
      password = decryptPassword(encryptedPassword);
    } catch (err) {
      console.error('Decrypt error:', err);
      return res.status(400).json({ error: '密码格式错误' });
    }

    // 从 Redis 获取用户密码
    const stored = await redis.hGet(redisKey.users, username);
    if (!stored) return res.status(401).json({ error: '用户名或密码错误' });

    // 验证密码
    const match = await bcrypt.compare(password, stored);
    if (!match) return res.status(401).json({ error: '用户名或密码错误' });

    const token = generateToken({ username });

    // 将 token 存入 Redis，设置过期时间（秒）与 JWT 保持一致
    const ttl = 2 * 60 * 60; // 2 hours
    await redis.set(`short-url:token:${token}`, username, { EX: ttl });

    res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 生成永久 API Key (需要登录)
router.post('/api/apikey', authMiddleware, async (req, res) => {
  try {
    const { username } = req.user;
    // 生成一个永久有效的 Token，并在 payload 中标记为 apiKey
    const token = generatePermanentToken({ username, type: 'apiKey' });

    // 存入 Redis，与普通 token 区分开
    await redis.set(`short-url:apikey:${token}`, username);

    // 将 API Key 存入用户的集合中，方便后续管理（如查询、撤销）
    await redis.sAdd(`short-url:user:${username}:apikeys`, token);

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '生成 API Key 失败' });
  }
});

// 退出登录
router.post('/api/logout', authMiddleware, async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (token) {
      // 删除 Redis 中的 token
      await redis.del(`short-url:token:${token}`);
    }
    res.json({ message: '退出成功' });
  } catch (err) {
    console.error('Logout error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前登录用户信息（用于前端验证 token 是否有效）
router.get('/api/me', authMiddleware, async (req, res) => {
  try {
    res.json({ username: req.user && req.user.username });
  } catch (err) {
    console.error('me error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// ==================== 短链相关路由 ====================

// 生成短链接(需鉴权)
router.post('/api/urls', authMiddleware, async (request, response) => {
  const encodedUrl = encodeURI(request.body.url);
  if (!/^((https|http)?:\/\/)[^\s]+/.test(encodedUrl)) {
    return response.status(400).json({ error: 'Incorrect URL format' }).end();
  }

  const username = request.user.username;

  // 检查链接数量限制
  let limit = await redis.get(`short-url:user:${username}:limit`);
  limit = limit ? parseInt(limit) : USER_URL_LIMIT;

  const currentCount = await redis.zCard(`short-url:user:${username}:urls`);
  if (currentCount >= parseInt(limit)) {
    return response.status(403).json({ error: `已达到最大链接数量限制 (${limit})` });
  }

  // 生成唯一的随机短链码
  const code = await generateUniqueCode();

  // 存储短链映射
  await redis.hSet(redisKey.map, code, encodedUrl);
  // 将短链添加到用户的短链集合 (使用 Sorted Set 记录时间戳)
  await redis.zAdd(`short-url:user:${username}:urls`, { score: Date.now(), value: code });

  response.json({ url: encodedUrl, code });
});

// 获取当前用户的短链列表（分页，按时间倒序）
router.get('/api/urls', authMiddleware, async (req, res) => {
  try {
    const username = req.user.username;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const key = `short-url:user:${username}:urls`;

    // 获取总数
    const total = await redis.zCard(key);

    // 分页获取 (倒序)
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const codes = await redis.zRange(key, start, end, { REV: true });

    // 获取每个短链的原始 URL
    const urls = [];
    for (const code of codes) {
      const url = await redis.hGet(redisKey.map, code);
      if (url) {
        urls.push({ code, url });
      }
    }

    res.json({ urls, total, page, pageSize });
  } catch (err) {
    console.error('Get urls error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除短链（需鉴权且验证所有权）
router.delete('/api/urls/:code', authMiddleware, async (req, res) => {
  try {
    const code = req.params.code;
    const username = req.user.username;
    const key = `short-url:user:${username}:urls`;

    // 验证短链是否存在
    const url = await redis.hGet(redisKey.map, code);
    if (!url) {
      return res.status(404).json({ error: '短链不存在' });
    }

    // 验证所有权
    const score = await redis.zScore(key, code);
    if (score === null) {
      return res.status(403).json({ error: '无权删除此短链' });
    }

    // 删除短链相关数据
    await redis.hDel(redisKey.map, code);
    await redis.zRem(key, code);

    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('Delete url error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
