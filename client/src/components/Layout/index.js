import React, { useCallback, useMemo } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, useMediaQuery,
} from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { Menu } from '@material-ui/icons';
import s from './index.module.css';
import Sider from './components/Sider';
import { lessThanMobile } from '../../services/theme';
import urls from '../../services/urls';

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
    <div className={s.root}>
      <div className={s.header}>
        <AppBar className={s.appbar}>
          <Toolbar>
            {(siderEnabled && mobile) && <IconButton onClick={onDrawer} edge="start"><Menu /></IconButton>}
            <Typography align="center" variant="h6">Your spotify</Typography>
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
