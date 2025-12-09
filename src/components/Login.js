import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import entityService from '../services/entity';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 页面加载时检查是否已有 token，若有则向后端验证有效性
    const checkLogged = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await entityService.me();
        if (data && data.username) {
          navigate('/');
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('token check error', err);
        localStorage.removeItem('token');
      }
    };
    checkLogged();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await entityService.login({ username, password });
      // const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        // 登录成功后跳转首页
        navigate('/');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  return (
    <div
      style={{
        maxWidth: 320,
        margin: '80px auto',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: 'center' }}>登录</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
          }}
        >
          登录
        </button>
      </form>
    </div>
  );
}

export default Login;
