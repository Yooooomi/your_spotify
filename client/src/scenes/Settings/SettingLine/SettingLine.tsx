import React from 'react';
import s from './index.module.css';

interface SettingLineProps {
  left: string;
  right: string;
}

export default function SettingLine({ left, right }: SettingLineProps) {
  return (
    <div className={s.root}>
      <strong>{left}</strong>
      <span>{right}</span>
    </div>
  );
}
