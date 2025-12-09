import axios from 'axios';

// 创建 axios 实例，统一处理 Authorization header
const api = axios.create({
  // baseURL 可按需配置
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 生成短链接
 * @param {string} url 原始链接
 * @returns 短链接
 */
const shortUrl = async (url) => {
  const res = await api.post('/url', { url });
  return res.data;
};

const login = async ({ username, password }) => {
  const res = await api.post('/api/login', { username, password });
  return res.data;
};

// 验证当前 token 是否有效，并返回用户信息
const me = async () => {
  const res = await api.get('/api/me');
  return res.data;
};

export default { shortUrl, login, me };
