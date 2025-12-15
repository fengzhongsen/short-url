import { useState } from 'react';
import Entity from './Entity';
import Search from './Search';
import UrlList from './UrlList';

const Body = () => {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="app-body-wrapper">
      <Search onSuccess={() => setRefresh((prev) => prev + 1)} />
      <Entity />
      <UrlList refresh={refresh} onDelete={() => setRefresh((prev) => prev + 1)} />
    </div>
  );
};

export default Body;
