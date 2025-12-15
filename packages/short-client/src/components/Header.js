import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Space, Modal, Tabs, Input, message, Alert } from 'antd';
import { LogoutOutlined, ApiOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import request from '../utils/request';
import { getOrigin } from '../utils/origin';

const { Title, Text, Paragraph } = Typography;

const Header = ({ showLogout = true }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleGenerateApiKey = async () => {
    setLoading(true);
    try {
      const res = await request.getApiKey();
      setApiKey(res.token);
      message.success('API Key 生成成功');
    } catch (error) {
      message.error('生成失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  // 获取当前域名，用于 MCP 配置
  const currentOrigin = getOrigin();

  // MCP 配置文件内容
  const mcpConfig = {
    mcpServers: {
      'short-url': {
        command: 'node',
        args: ['/path/to/your/mcp-server.js'],
        env: {
          API_URL: `${currentOrigin}/api/urls`,
          API_KEY: apiKey || 'YOUR_API_KEY_HERE',
        },
      },
    },
  };

  return (
    <div className="header-container">
      {showLogout && (
        <div className="header-logout">
          <Space>
            <Button type="text" icon={<ApiOutlined />} onClick={() => setIsModalOpen(true)}>
              API & MCP
            </Button>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出登录
            </Button>
          </Space>
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

      <Modal
        title="API 访问与 MCP 配置"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'API Token',
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="永久 Token"
                    description="此 Token 永久有效，可用于脚本调用或配置 MCP 服务。请妥善保管，不要泄露。"
                    type="warning"
                    showIcon
                  />

                  {!apiKey ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Button type="primary" onClick={handleGenerateApiKey} loading={loading}>
                        生成永久 API Key
                      </Button>
                    </div>
                  ) : (
                    <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                      <Paragraph
                        style={{
                          wordBreak: 'break-all',
                          marginBottom: '10px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {apiKey}
                      </Paragraph>
                      <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(apiKey)}
                      >
                        复制 Token
                      </Button>
                    </div>
                  )}
                </Space>
              ),
            },
            {
              key: '2',
              label: 'MCP 配置',
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph>
                    将以下配置添加到您的 MCP 客户端配置文件中（如 Claude Desktop 的{' '}
                    <code>claude_desktop_config.json</code> 或 VS Code 的 MCP 扩展配置），即可在 AI
                    对话中使用短链生成功能。
                  </Paragraph>
                  <Paragraph>
                    <Text type="secondary">
                      注意：您需要先下载项目根目录下的 <code>mcp-server.js</code> 文件到本地。
                    </Text>
                  </Paragraph>
                  <Button
                    icon={<DownloadOutlined />}
                    href="/mcp-server.js"
                    download="mcp-server.js"
                  >
                    下载 mcp-server.js
                  </Button>
                  <Input.TextArea
                    value={JSON.stringify(mcpConfig, null, 2)}
                    autoSize={{ minRows: 6, maxRows: 10 }}
                    readOnly
                    style={{ fontFamily: 'monospace', background: '#f5f5f5' }}
                  />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(JSON.stringify(mcpConfig, null, 2))}
                  >
                    复制配置
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default Header;
