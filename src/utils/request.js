import axios from 'axios';
const { encrypt } = require('./encrypt');

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

// 响应拦截器：处理 401 错误，自动跳转登录
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token 无效或过期，清除并跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 注册
const register = async ({ username, password }) => {
  const res = await api.post('/api/register', {
    username,
    password: encrypt(password),
  });
  return res.data;
};

// 登录
const login = async ({ username, password }) => {
  const res = await api.post('/api/login', {
    username,
    password: encrypt(password),
  });
  return res.data;
};

// 退出登录
const logout = async () => {
  await api.post('/api/logout');
};

// 验证当前 token 是否有效，并返回用户信息
const me = async () => {
  const res = await api.get('/api/me');
  return res.data;
};

/**
 * 生成短链接
 * @param {string} url 原始链接
 * @returns 短链接
 */
const shortUrl = async (url) => {
  const res = await api.post('/api/urls', { url });
  return res.data;
};

// 获取当前用户的短链列表（分页）
const getUrlList = async (page = 1, pageSize = 10) => {
  const res = await api.get('/api/urls', {
    params: { page, pageSize },
  });
  return res.data;
};

// 删除短链
const deleteUrl = async (code) => {
  const res = await api.delete(`/api/urls/${code}`);
  return res.data;
};

// 获取 API Key
const getApiKey = async () => {
  const res = await api.post('/api/apikey');
  return res.data;
};

const request = { shortUrl, login, me, register, getUrlList, deleteUrl, logout, getApiKey };

export default request;
