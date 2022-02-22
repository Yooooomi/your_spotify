import React from 'react';
import clsx from 'clsx';
import s from './index.module.css';

interface TitleCardProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  fade?: boolean;
  right?: React.ReactNode;
}

export default function TitleCard({ className, title, children, fade, right }: TitleCardProps) {
  return (
    <div className={clsx(s.root, className)}>
      <div className={s.container}>
        <div className={s.title}>
          <h3>{title}</h3>
          <div>{right}</div>
        </div>
        <div className={clsx(s.content, { fade })}>{children}</div>
      </div>
    </div>
  );
}
