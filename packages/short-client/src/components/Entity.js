import copy from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import { useSelector } from 'react-redux';
import { Card, Button, Image, Descriptions, message, Space, Typography } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';

const { Link } = Typography;

const Entity = () => {
  const entity = useSelector((state) => state.entity);
  const [messageApi, contextHolder] = message.useMessage();

  if (!entity) {
    return null;
  }

  // 下载二维码事件
  const handleDownload = async () => {
    try {
      const res = await fetch(entity.qrcode);
      const blob = await res.blob();
      saveAs(blob, `QRCode_${entity.code}.png`);
    } catch (e) {
      messageApi.error('下载失败');
    }
  };

  // 复制短链接事件
  const handleCopy = () => {
    copy(entity.shortUrl);
    messageApi.success('复制成功');
  };

  return (
    <Card bordered={false} className="entity-card">
      {contextHolder}
      <div className="entity-container">
        <div className="entity-qrcode-wrapper">
          <Image width={160} src={entity.qrcode} alt="QRCode" className="entity-qrcode" />
        </div>
        <div className="entity-content">
          <Descriptions column={1} bordered size="small" className="entity-descriptions">
            <Descriptions.Item label="短链接">
              <Link href={entity.shortUrl} target="_blank" className="entity-link" copyable>
                {entity.shortUrl}
              </Link>
            </Descriptions.Item>
            <Descriptions.Item label="原链接">
              <Link href={entity.originUrl} target="_blank" type="secondary">
                {entity.originUrl}
              </Link>
            </Descriptions.Item>
          </Descriptions>

          <Space className="entity-actions">
            <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
              复制短链
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载二维码
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default Entity;
