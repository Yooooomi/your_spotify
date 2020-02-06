import React from 'react';
import s from './index.module.css';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
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
                            <Typography className={s.stat}>You listened to 6 hours of music today</Typography>
                        </Toolbar>
                    </AppBar>
                </div>
                <div className={s.page}>
                    <div className={s.sider}>
                        <Sider />
                    </div>
                    <div className={s.content}>
                        {children}
                    </div>
                </div>
            </div>
        )
    }
}

export default Layout;