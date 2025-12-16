import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import copy from 'copy-to-clipboard';
import { saveAs } from 'file-saver';
import { Table, Button, Space, Popconfirm, message, Tooltip, Typography, Card } from 'antd';
import { CopyOutlined, DeleteOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import request from '../utils/request';
import { getOrigin } from '../utils/origin';

const { Link, Text, Title } = Typography;

const UrlList = ({ refresh, onDelete }) => {
  const [urls, setUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const pageSize = 10;

  const origin = getOrigin();

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request.getUrlList(page, pageSize);
      setUrls(data.urls || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('获取短链列表失败:', error);
      messageApi.error(error.message || '获取列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, messageApi]);

  useEffect(() => {
    fetchUrls();
  }, [page, refresh, fetchUrls]);

  const handleDelete = async (code) => {
    try {
      await request.deleteUrl(code);
      messageApi.success('删除成功');
      onDelete();
      // 如果当前页删除后没数据了,回到上一页
      if (urls.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUrls();
      }
    } catch (error) {
      messageApi.error(error.message || '删除失败');
    }
  };

  const handleCopy = (code) => {
    const shortUrl = `${origin}/${code}`;
    copy(shortUrl);
    messageApi.success('复制成功');
  };

  const handleDownloadQR = async (code) => {
    try {
      const shortUrl = `${origin}/${code}`;
      const qrcode = await QRCode.toDataURL(shortUrl, { errorCorrectionLevel: 'H' });
      const res = await fetch(qrcode);
      const blob = await res.blob();
      saveAs(blob, `QRCode_${code}.png`);
    } catch (error) {
      messageApi.error('下载二维码失败');
    }
  };

  const columns = [
    {
      title: '短链接',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Link href={`${origin}/${code}`} target="_blank" copyable={{ text: `${origin}/${code}` }}>
          {origin}/{code}
        </Link>
      ),
    },
    {
      title: '原链接',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url) => (
        <Link href={url} target="_blank" className="url-list-link-secondary">
          <LinkOutlined /> {url}
        </Link>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="复制短链接">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record.code)}
              className="url-list-icon-teal"
            />
          </Tooltip>
          <Tooltip title="下载二维码">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadQR(record.code)}
              className="url-list-icon-teal"
            />
          </Tooltip>
          <Popconfirm
            title="确认删除此短链接?"
            onConfirm={() => handleDelete(record.code)}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (urls.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="url-list-container">
      {contextHolder}
      <Title level={3} className="url-list-title">
        我的短链接{' '}
        <Text type="secondary" className="url-list-count">
          ({total})
        </Text>
      </Title>
      <Card bordered={false} className="url-list-card">
        <Table
          columns={columns}
          dataSource={urls}
          rowKey="code"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (p) => setPage(p),
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default UrlList;
