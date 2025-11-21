import { Ref } from "react";
import { Paper } from "@mui/material";
import clsx from "clsx";
import Text from "../Text";
import s from "./index.module.css";

interface ChartCardProps {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  noBorder?: boolean;
}

function ChartCard({ ref, className, title, right, children, noBorder }: ChartCardProps) {
  return (
    <Paper
      ref={ref}
      className={clsx(s.root, className, {
        [s.noborder]: noBorder,
      })}>
      <div className={s.title}>
        <Text size="big" weight="bold">
          {title}
        </Text>
        {right}
      </div>
      <div className={s.content}>{children}</div>
    </Paper>
  );
}

export default ChartCard;
