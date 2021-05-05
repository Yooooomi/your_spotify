import React, { useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, useMediaQuery,
} from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import s from './index.module.css';
import Sider from './components/Sider';
import { lessThanMobile } from '../../services/theme';

function Layout({ children }) {
  const onDrawer = useCallback(() => {
    window.openDrawer();
  }, []);

  const mobile = useMediaQuery(lessThanMobile);

  return (
    <div className={s.root}>
      <div className={s.header}>
        <AppBar>
          <Toolbar className={s.toolbar}>
            {mobile && <IconButton onClick={onDrawer} edge="start"><Menu /></IconButton>}
            <Typography align="center" variant="h6">Your spotify</Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={s.page}>
        <div className={s.siderContainer}>
          <div className={s.sider}>
            <Sider />
          </div>
        </div>
        <div className={s.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
