import clsx from 'clsx';
import s from './index.module.css';
import Text from '../Text';

interface TitleCardProps {
  className?: string;
  contentClassName?: string;
  title: string;
  children: React.ReactNode;
  fade?: boolean;
  right?: React.ReactNode;
  noPadding?: boolean;
}

export default function TitleCard({
  className,
  contentClassName,
  title,
  children,
  fade,
  right,
  noPadding,
}: TitleCardProps) {
  return (
    <div className={clsx(s.root, className)}>
      <div className={clsx(s.container, { [s.nopadding]: noPadding })}>
        <div className={s.title}>
          <Text element="h3">{title}</Text>
          <div>{right}</div>
        </div>
        <div className={clsx(s.content, { fade }, contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
