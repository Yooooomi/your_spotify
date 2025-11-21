import { useRef, useState } from "react";
import { MoreHoriz, MoreVert } from "@mui/icons-material";
import {
  Button,
  ClickAwayListener,
  Fade,
  IconButton,
  Popper,
  Tooltip,
} from "@mui/material";
import clsx from "clsx";
import s from "./index.module.css";

export interface ThreePointItem {
  label: string;
  onClick: () => void;
  style?: "normal" | "destructive";
  disabled?: boolean;
  disabledTooltip?: string;
}

interface ThreePointsProps {
  items: ThreePointItem[];
  horizontal?: boolean;
}

export default function ThreePoints({ items, horizontal }: ThreePointsProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const internClick = (index: number) => {
      items[index]?.onClick();
      setOpen(false);
    };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <IconButton
          size="small"
          ref={buttonRef}
          onClick={() => setOpen(v => !v)}>
          {horizontal ? (
            <MoreHoriz fontSize="small" />
          ) : (
            <MoreVert fontSize="small" />
          )}
        </IconButton>
        <Popper
          open={open}
          anchorEl={buttonRef.current}
          popperOptions={{ placement: "auto-start" }}
          transition>
          {({ TransitionProps }) => (

            <Fade {...TransitionProps}>
              <div className={s.popper}>
                {items.map((item, index) => (
                  <Tooltip
                    key={item.label}
                    title={(item.disabled && item.disabledTooltip) || ""}>
                    <Button

                      key={index}
                      variant="text"
                      disabled={item.disabled}
                      className={clsx({
                        [s.item]: true,
                        [s[item.style ?? "normal"]]: true,
                      })}
                      onClick={() => internClick(index)}>
                      {item.label}
                    </Button>
                  </Tooltip>
                ))}
                {items.length === 0 && (
                  <Button

                    variant="text"
                    disabled>
                    No action available
                  </Button>
                )}
              </div>
            </Fade>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
