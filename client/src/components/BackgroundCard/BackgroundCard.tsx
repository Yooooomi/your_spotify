import React from 'react';
import s from './index.module.css';

interface BackgroundCardProps {
  top?: React.ReactNode;
  middle?: React.ReactNode;
  bottom?: React.ReactNode;
  background: string;
}

export default function BackgroundCard({
  background,
  top,
  middle,
  bottom,
}: BackgroundCardProps) {
  return (
    <div className={s.root} style={{ backgroundImage: `url('${background}')` }}>
      <div>{top}</div>
      <div>{middle}</div>
      <div>{bottom}</div>
    </div>
  );
}
