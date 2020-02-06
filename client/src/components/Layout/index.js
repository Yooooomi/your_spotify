import React from 'react';
import s from './index.module.css';

class Layout extends React.Component {
    render() {
        const { children } = this.props;

        return (
            <div className={s.root}>
                { children }
            </div>
        )
    }
}

export default Layout;