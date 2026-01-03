import { ReactNode } from "react";
import s from "./index.module.css";

interface MenuTitleProps {
  children: ReactNode;
}

export function MenuTitle({ children }: MenuTitleProps) {
  return <strong className={s.root}>{children}</strong>;
}
