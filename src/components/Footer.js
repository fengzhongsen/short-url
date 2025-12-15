import { Typography } from 'antd';
import { HeartFilled, GithubOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const Footer = () => {
  return (
    <div className="footer-container">
      <Text type="secondary">
        © 2021-2025 <HeartFilled className="footer-heart" />
        <Text strong>欧布欧开</Text> 版权所有 ｜{' '}
        <Link href="https://github.com/fengzhongsen/short-url" target="_blank">
          <GithubOutlined /> GitHub
        </Link>
      </Text>
    </div>
  );
};

export default Footer;
