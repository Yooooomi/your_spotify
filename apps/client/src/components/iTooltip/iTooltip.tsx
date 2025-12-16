import { InfoOutline } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import s from './index.module.css'
import { ReactNode } from "react";

interface ITooltipProps {
  content?: ReactNode;
}

export function ITooltip({ content }: ITooltipProps) {
  if (!content) {
    return null;
  }

  return (
    <Tooltip title={content}>
      <InfoOutline fontSize="small" className={s.icon} />
    </Tooltip>
  );
}