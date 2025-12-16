import clsx from "clsx";
import Text from "../Text";
import s from "./index.module.css";
import { ITooltip } from "../iTooltip/iTooltip";

interface TitleCardProps {
  className?: string;
  contentClassName?: string;
  title: string;
  children: React.ReactNode;
  fade?: boolean;
  right?: React.ReactNode;
  noPadding?: boolean;
  noBorder?: boolean;
  info?: string;
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
  info,
}: TitleCardProps) {
  return (
    <div className={clsx(s.root, className, { [s.noborder]: noBorder })}>
      <div className={clsx(s.container, { [s.nopadding]: noPadding })}>
        <div className={s.title}>
          <div className={s.left}>
            <Text element="h3" size='big'>{title}</Text>
            <ITooltip content={info} />
          </div>
          <div>{right}</div>
        </div>
        <div className={clsx(s.content, { fade }, contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
