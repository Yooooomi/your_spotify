import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import s from './index.module.css';
import Sider from './components/Sider';

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className={s.root}>
        <div className={s.header}>
          <AppBar>
            <Toolbar className={s.toolbar}>
              <Typography variant="h6">Your spotify</Typography>
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
}

export default Layout;
