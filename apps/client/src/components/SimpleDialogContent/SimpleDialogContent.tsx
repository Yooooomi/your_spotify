import { ReactNode } from "react";
import Text from "../Text";
import s from "./index.module.css";

interface SimpleDialogContentProps {
  message: string;
  actions: ReactNode;
}

export default function SimpleDialogContent({
  message,
  actions,
}: SimpleDialogContentProps) {
  return (
    <div>
      <Text size="normal">{message}</Text>
      <div className={s.actions}>{actions}</div>
    </div>
  );
}
