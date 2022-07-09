import React from 'react';
import { Paper } from '@mui/material';
import clsx from 'clsx';
import s from './index.module.css';
import Text from '../Text';

interface ChartCardProps {
  className?: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export default function ChartCard({
  className,
  title,
  right,
  children,
}: ChartCardProps) {
  return (
    <Paper className={clsx(s.root, className)}>
      <div className={s.title}>
        <Text element="h3">{title}</Text>
        {right}
      </div>
      <div className={s.content}>{children}</div>
    </Paper>
  );
}
