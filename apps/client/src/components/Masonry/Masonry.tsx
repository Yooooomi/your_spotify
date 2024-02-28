import { ReactNode } from "react";
import { useMobile } from "../../services/hooks/hooks";
import s from "./index.module.css";

interface MasonryProps {
  children: ReactNode[];
}

export default function Masonry({ children }: MasonryProps) {
  const [, isTablet] = useMobile();

  if (isTablet) {
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
