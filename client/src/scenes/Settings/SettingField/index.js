import React from 'react';
import s from './index.module.css';

function SettingField({ title, subtitle, children }) {
  return (
    <div className={s.root}>
      <div>
        <span className={s.title}>
          {title}
        </span>
        <span className={s.sub}>
          {subtitle}
        </span>
      </div>
      {children}
    </div>
  );
}

export default SettingField;
