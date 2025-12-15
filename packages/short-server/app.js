const express = require('express');
const path = require('path');
const morgan = require('morgan');
const routes = require('./routes');
const { redis, redisKey } = require('./redis');

const app = express();

// Morgan logging configuration
morgan.token('body', (req) => JSON.stringify(req.body));

// Middleware
// 指向 short-client 的 build 目录
app.use(express.static(path.join(__dirname, '../short-client/build')));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// API Routes
app.use(routes);

// 重定向短链接
app.get('/:code', async (request, response, next) => {
  const code = request.params.code;
  const originUrl = await redis.hGet(redisKey.map, code);
  if (!originUrl) {
    // 如果短链不存在，可能是前端路由（如 /login），交给后续中间件处理
    return next();
  }
  response.redirect(originUrl);
});

// 处理所有其他请求，返回前端 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../short-client/build', 'index.html'));
});

module.exports = app;
