import { Paper } from "@material-ui/core";
import React from "react";
import s from "./index.module.css";
import clsx from "clsx";

interface TitleCardProps {
  className?: string;
  title: string;
  children: React.ReactNode;
}

export default function TitleCard({
  className,
  title,
  children,
}: TitleCardProps) {
  return (
    <Paper className={clsx(s.root, className)}>
      <h3>{title}</h3>
      <div className={s.content}>{children}</div>
    </Paper>
  );
}
