import { useRef } from "react";
import { IconButton, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { Track } from "../../services/types";
import { useBooleanState, useIsGuest } from "../../services/hooks/hooks";
import TrackOptionsContent from "../TrackOptionsContent";
import { MenuTitle } from "../MenuTitle/MenuTitle";
import s from "./index.module.css";

interface TrackOptionsProps {
  track: Track;
}

export const TRACK_OPTIONS_WIDTH = 34;

export default function TrackOptions({ track }: TrackOptionsProps) {
  const ref = useRef(null);
  const [isOpen, open, close] = useBooleanState();
  const isGuest = useIsGuest();

  const handleClick = event => {
      event.stopPropagation();
      open();
    };

  if (isGuest) {
    return <div className={s.guest} />;
  }

  return (
    <>
      <IconButton ref={ref} size="small" onClick={handleClick} disableRipple>
        <MoreVert fontSize="small" />
      </IconButton>
      <Popover
        open={isOpen}
        onClose={close}
        anchorEl={() => ref.current}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuTitle>{track.name}</MenuTitle>
        <TrackOptionsContent onClose={close} track={track} />
      </Popover>
    </>
  );
}
