import React from 'react';
import s from './index.module.css';

interface FullscreenCenteredProps {
  children: React.ReactNode;
}

export default function FullscreenCentered({
  children,
}: FullscreenCenteredProps) {
  return <div className={s.root}>{children}</div>;
}
