import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Drawer, IconButton, useMediaQuery } from '@mui/material';
import { Menu } from '@mui/icons-material';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import s from './index.module.css';
import Sider from './Sider';
import { selectPublicToken } from '../../services/redux/modules/user/selector';
import Text from '../Text';

interface LayoutProps {
  children: React.ReactNode;
}

const hideSideOnRoutes = ['/login', '/register'];

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const routeAllowsSider = !hideSideOnRoutes.includes(pathname);
  const showSider = !useMediaQuery('(max-width: 900px)');

  const publicToken = useSelector(selectPublicToken);

  const drawer = useCallback(() => {
    setOpen(old => !old);
  }, []);

  return (
    <div className={s.root}>
      {routeAllowsSider && !showSider && (
        <Drawer open={open} anchor="left" onClose={() => setOpen(false)}>
          <Sider />
        </Drawer>
      )}
      <section className={s.sider}>
        {routeAllowsSider && showSider && <Sider />}
      </section>
      <section
        className={clsx({
          [s.content]: true,
          [s.contentdrawer]: routeAllowsSider && showSider,
        })}>
        {publicToken && (
          <div className={s.publictoken}>
            <Text>You are viewing as guest</Text>
          </div>
        )}
        {routeAllowsSider && !showSider && (
          <IconButton onClick={drawer} className={s.drawerbutton}>
            <Menu />
          </IconButton>
        )}
        {children}
      </section>
    </div>
  );
}
