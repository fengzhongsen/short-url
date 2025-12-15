import { useSelector } from 'react-redux';
import { Alert } from 'antd';

const Error = () => {
  const error = useSelector((state) => state.error);
  if (!error) {
    return null;
  }
  return <Alert message={error} type="error" showIcon className="error-alert" />;
};

export default Error;
