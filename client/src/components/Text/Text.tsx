import clsx from 'clsx';
import React, { ReactNode } from 'react';
import s from './index.module.css';

interface TextProps {
  className?: string;
  children: ReactNode;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'span' | 'strong' | 'div';
  onDark?: boolean;
}

export default function Text({
  className,
  children,
  element,
  onDark,
}: TextProps) {
  return React.createElement(
    element ?? 'span',
    {
      className: clsx(className, onDark ? s.onDark : s.root),
    },
    children,
  );
}
