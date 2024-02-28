import { forwardRef } from "react";
import { Paper } from "@mui/material";
import clsx from "clsx";
import Text from "../Text";
import s from "./index.module.css";

interface ChartCardProps {
  className?: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  noBorder?: boolean;
}

const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(
  ({ className, title, right, children, noBorder }, ref) => {
    s.yoyo;
    return (
      <Paper
        ref={ref}
        className={clsx(s.root, className, {
          [s.noborder]: noBorder,
        })}>
        <div className={s.title}>
          <Text element="h3">{title}</Text>
          {right}
        </div>
        <div className={s.content}>{children}</div>
      </Paper>
    );
  },
);

export default ChartCard;
