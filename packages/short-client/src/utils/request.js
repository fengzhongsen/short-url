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
  (response) => {
    const res = response.data;
    // 如果是二进制数据（如文件下载），直接返回
    if (response.config.responseType === 'blob') {
      return res;
    }

    if (res.code === 0) {
      return res.data; // Unwrap data
    } else {
      // 业务错误，抛出异常
      const error = new Error(res.msg || 'Error');
      error.response = response; // Attach response for compatibility
      error.data = res; // Attach full response data
      return Promise.reject(error);
    }
  },
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
const register = ({ username, password }) => {
  return api.post('/api/register', {
    username,
    password: encrypt(password),
  });
};

// 登录
const login = ({ username, password }) => {
  return api.post('/api/login', {
    username,
    password: encrypt(password),
  });
};

// 退出登录
const logout = () => {
  return api.post('/api/logout');
};

// 验证当前 token 是否有效，并返回用户信息
const me = () => {
  return api.get('/api/me');
};

/**
 * 生成短链接
 * @param {string} url 原始链接
 * @returns 短链接
 */
const shortUrl = (url) => {
  return api.post('/api/urls', { url });
};

// 获取当前用户的短链列表（分页）
const getUrlList = (page = 1, pageSize = 10) => {
  return api.get('/api/urls', {
    params: { page, pageSize },
  });
};

// 删除短链
const deleteUrl = (code) => {
  return api.delete(`/api/urls/${code}`);
};

// 获取 API Key
const getApiKey = () => {
  return api.post('/api/apikey');
};

const request = { shortUrl, login, me, register, getUrlList, deleteUrl, logout, getApiKey };

export default request;
