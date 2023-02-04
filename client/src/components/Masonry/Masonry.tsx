import { useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';
import s from './index.module.css';

interface MasonryProps {
  children: ReactNode[];
}

export default function Masonry({ children }: MasonryProps) {
  const isMobile = useMediaQuery('(max-width: 1250px)');

  if (isMobile) {
    return <div className={s.mobile}>{children}</div>;
  }
  return (
    <div className={s.web}>
      <div className={s.webelement}>
        {children.filter((_, k) => k % 2 === 0)}
      </div>
      <div className={s.webelement}>
        {children.filter((_, k) => k % 2 === 1)}
      </div>
    </div>
  );
}
