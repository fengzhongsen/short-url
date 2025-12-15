import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import request from '../utils/request';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogged = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await request.me();
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

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const data = await request.login(values);
      if (data.token) {
        localStorage.setItem('token', data.token);
        message.success('登录成功');
        navigate('/');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card title="登录" className="auth-card">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div className="auth-link">
            <Link to="/register">还没有账号？去注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
