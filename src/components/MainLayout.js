import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  const location = useLocation();
  const showLogout = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-layout">
      <div className="fixed-header">
        <Header showLogout={showLogout} />
      </div>
      <div className="scrollable-content">
        <Outlet />
      </div>
      <div className="fixed-footer">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
