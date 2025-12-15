import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text } = Typography;

const Header = ({ showLogout = true }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await request.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="header-container">
      {showLogout && (
        <div className="header-logout">
          <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      )}
      <div>
        <Title level={1} className="header-title">
          <img src="/favicon.svg" alt="Logo" className="header-logo" />
          极简短链
        </Title>
        <Text type="secondary" className="header-subtitle">
          简单易用的短链接生成工具，链接永久有效！
        </Text>
      </div>
    </div>
  );
};

export default Header;
