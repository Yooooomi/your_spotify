import React from "react";
import { Paper } from "@material-ui/core";
import s from "./index.module.css";
import clsx from "clsx";

interface ChartCardProps {
  className?: string;
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({
  className,
  title,
  children,
}: ChartCardProps) {
  return (
    <Paper className={clsx(s.root, className)}>
      <h3>{title}</h3>
      <div className={s.content}>{children}</div>
    </Paper>
  );
}
