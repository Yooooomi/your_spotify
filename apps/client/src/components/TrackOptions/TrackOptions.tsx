import React, { useRef } from "react";
import { IconButton, Popover } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import { Track } from "../../services/types";
import { useBooleanState, useIsGuest } from "../../services/hooks/hooks";
import TrackOptionsContent from "../TrackOptionsContent";
import s from "./index.module.css";

interface TrackOptionsProps {
  track: Track;
}

export const TRACK_OPTIONS_WIDTH = 34;

export default function TrackOptions({ track }: TrackOptionsProps) {
  const ref = useRef(null);
  const [isOpen, open, close] = useBooleanState();
  const isGuest = useIsGuest();

  if (isGuest) {
    return <div className={s.guest} />;
  }

  return (
    <>
      <IconButton ref={ref} size="small" onClick={open} disableRipple>
        <MoreHoriz fontSize="small" />
      </IconButton>
      <Popover
        open={isOpen}
        onClose={close}
        anchorEl={ref.current}
        PaperProps={{ className: s.root }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <strong>{track.name}</strong>
        <TrackOptionsContent onClose={close} track={track} />
      </Popover>
    </>
  );
}
