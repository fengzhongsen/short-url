import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearEntity, generateShortUrl } from '../reducers/entityReducer';
import { clearError, setError } from '../reducers/errorReducer';
import { Input, Button, Card, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Error from './Error';

const Search = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    dispatch(clearError());
    dispatch(clearEntity());
    if (!/^((https|http)?:\/\/)[^\s]+/.test(encodeURI(url))) {
      dispatch(setError('URL 格式有误，请输入 http:// 或 https:// 开头的网址'));
    } else {
      setLoading(true);
      try {
        await dispatch(generateShortUrl(url));
        setUrl('');
        if (onSuccess) onSuccess();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyup = (event) => {
    if (event.keyCode === 13) {
      handleClick();
    }
  };

  return (
    <Card bordered={false} className="search-card">
      <Space.Compact className="search-compact" size="large">
        <Input
          placeholder="请输入 http:// 或 https:// 开头的网址"
          value={url}
          onChange={({ target }) => setUrl(target.value)}
          onKeyUp={handleKeyup}
          prefix={<LinkOutlined className="search-icon" />}
        />
        <Button type="primary" onClick={handleClick} loading={loading} size="large">
          生成短链
        </Button>
      </Space.Compact>
      <Error />
    </Card>
  );
};

export default Search;
