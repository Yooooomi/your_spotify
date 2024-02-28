import clsx from "clsx";
import Text from "../Text";
import s from "./index.module.css";

interface TitleCardProps {
  className?: string;
  contentClassName?: string;
  title: string;
  children: React.ReactNode;
  fade?: boolean;
  right?: React.ReactNode;
  noPadding?: boolean;
  noBorder?: boolean;
}

export default function TitleCard({
  className,
  contentClassName,
  title,
  children,
  fade,
  right,
  noPadding,
  noBorder,
}: TitleCardProps) {
  return (
    <div className={clsx(s.root, className, { [s.noborder]: noBorder })}>
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
