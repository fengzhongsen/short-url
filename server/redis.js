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
  map: 'short-url:map',
  users: 'short-url:users',
  // tokens will be stored as keys: short-url:token:<token> -> username (with TTL)
  // user urls: short-url:user:<username>:urls -> set of codes
};

module.exports = { redis, redisKey };
