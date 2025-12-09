require('dotenv').config();
const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const morgan = require('morgan');
morgan.token('body', (req) => JSON.stringify(req.body));

const Redis = require('redis');
const redis = Redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  username: process.env.REDIS_USERNAME || null,
  password: process.env.REDIS_PASSWORD || null,
  pingInterval: 5 * 60 * 1000,
});
redis.on('error', (err) => console.error(err, 'Redis error'));
redis.on('connect', () => console.log('Redis is connect'));
redis.on('reconnecting', () => console.log('Redis is reconnecting'));
redis.on('ready', () => console.log('Redis is ready'));
const redisKey = {
  code: 'short-url:code',
  map: 'short-url:map',
  users: 'short-url:users',
  // tokens will be stored as keys: short-url:token:<token> -> username (with TTL)
  // you can also maintain a user->token mapping if needed
};

const _alphabet = 'GS2w4R6789IbcdHEXhijWZAzopTrxPNq3sLMJalBVyQeDmY0nugtF5Uv1fkOCK';
const _base = _alphabet.length;
const encode = (id) => {
  let code = '';
  while (id > 0) {
    code = _alphabet.charAt(id % _base) + code;
    id = Math.floor(id / _base);
  }
  return code;
};

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/:code', async (request, response) => {
  const code = request.params.code;
  const originUrl = await redis.hGet(redisKey.map, code);
  if (!originUrl) {
    return response.status(404).json({ error: 'Unknown URL' }).end();
  }
  response.redirect(originUrl);
});

// 鉴权中间件：校验 Authorization: Bearer <token>
const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: '未提供 token' });
    // 校验 JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'short-url-secret');
    } catch (err) {
      return res.status(401).json({ error: '无效 token' });
    }
    // 确认 token 在 Redis 中存在（支持服务端撤销/过期控制）
    const owner = await redis.get(`short-url:token:${token}`);
    if (!owner) return res.status(401).json({ error: 'Token 无效或已过期' });
    req.user = payload;
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(500).json({ error: '服务器错误' });
  }
};

app.post('/url', authMiddleware, async (request, response) => {
  const encodedUrl = encodeURI(request.body.url);
  if (!/^((https|http)?:\/\/)[^\s]+/.test(encodedUrl)) {
    return response.status(400).json({ error: 'Incorrect URL format' }).end();
  }
  const id = await redis.incrBy(redisKey.code, 1);
  const code = encode(id);
  await redis.hSet(redisKey.map, code, encodedUrl);
  response.json({ url: encodedUrl, code });
});

// 登录接口：密码从 Redis 中读取并比对，登录成功后将 token 存入 Redis（带过期）
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: '缺少用户名或密码' });

    // 从 Redis 获取用户密码（建议存储为 bcrypt hash）
    const stored = await redis.hGet(redisKey.users, username);
    if (!stored) return res.status(401).json({ error: '用户名或密码错误' });

    let match = false;
    // 如果是 bcrypt hash（以 $2 开头），使用 bcrypt 比对；否则按明文比较（不推荐）
    if (typeof stored === 'string' && stored.startsWith('$2')) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = password === stored;
    }

    if (!match) return res.status(401).json({ error: '用户名或密码错误' });

    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'short-url-secret', {
      expiresIn: '2h',
    });

    // 将 token 存入 Redis，设置过期时间（秒）与 JWT 保持一致
    const ttl = 2 * 60 * 60; // 2 hours
    await redis.set(`short-url:token:${token}`, username, { EX: ttl });

    res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前登录用户信息（用于前端验证 token 是否有效）
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    res.json({ username: req.user && req.user.username });
  } catch (err) {
    console.error('me error', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

const PORT = 3001;
redis.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
