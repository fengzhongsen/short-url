import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

function RequireAuth({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');

      // 没有 token，直接跳转登录
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 验证 token 是否有效
        await request.me();
      } catch (error) {
        // token 无效或过期，清除并跳转登录
        console.error('Token 验证失败:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    validateToken();
  }, [navigate]);

  return children;
}

export default RequireAuth;
