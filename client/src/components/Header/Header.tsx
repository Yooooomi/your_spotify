import { useMediaQuery } from '@mui/material';
import React from 'react';
import IntervalSelector from '../IntervalSelector';
import s from './index.module.css';

interface HeaderProps {
  left?: React.ReactNode;
  title: string;
  subtitle: string;
  interval?: string;
  onChange?: (newInterval: string) => void;
}

export default function Header({ left, title, subtitle, interval, onChange }: HeaderProps) {
  const showSider = !useMediaQuery('(max-width: 900px)');

  return (
    <div className={s.root}>
      <div className={s.left}>
        {left}
        <div className={s.texts}>
          <h1>{title}</h1>
          {showSider && <span>{subtitle}</span>}
        </div>
      </div>
      {interval && (
        <div>
          <IntervalSelector value={interval} onChange={onChange || (() => {})} />
        </div>
      )}
    </div>
  );
}
