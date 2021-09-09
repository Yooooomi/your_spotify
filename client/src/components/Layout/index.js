import React, { useCallback, useMemo } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, useMediaQuery,
} from '@material-ui/core';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from '@material-ui/icons';
import s from './index.module.css';
import Sider from './components/Sider';
import { lessThanMobile } from '../../services/theme';
import urls from '../../services/urls';
import SearchBar from '../SearchBar';

const authUrls = [
  urls.login,
  urls.logout,
  urls.register,
];

function Layout({ children }) {
  const location = useLocation();
  const siderEnabled = useMemo(() => !authUrls.some(e => location.pathname.startsWith(e)), [location]);

  const onDrawer = useCallback(() => {
    window.openDrawer();
  }, []);

  const mobile = useMediaQuery(lessThanMobile);

  return (
    <div>
      <div className={s.header}>
        <AppBar className={s.appbar}>
          <Toolbar className={s.toolbar}>
            <div>
              {(siderEnabled && mobile) && <IconButton onClick={onDrawer} edge="start"><Menu /></IconButton>}
              {!mobile && (
                <Link to={urls.home} className="nolink">
                  <Typography align="center" variant="h6">Your spotify</Typography>
                </Link>
              )}
            </div>
            <div>
              <SearchBar />
            </div>
            <div />
          </Toolbar>
        </AppBar>
      </div>
      <div className={s.page}>
        {siderEnabled && (
          <div className={s.siderContainer}>
            <div className={s.sider}>
              <Sider />
            </div>
          </div>
        )}
        <div className={s.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
