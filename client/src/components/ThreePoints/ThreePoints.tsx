import React, { useCallback, useRef, useState } from 'react';
import { MoreHoriz } from '@mui/icons-material';
import {
  Button,
  ClickAwayListener,
  Fade,
  IconButton,
  Popper,
  Tooltip,
} from '@mui/material';
import clsx from 'clsx';
import s from './index.module.css';

export interface ThreePointItem {
  label: string;
  onClick: () => void;
  style?: 'normal' | 'destructive';
  disabled?: boolean;
  disabledTooltip?: string;
}

interface ThreePointsProps {
  items: ThreePointItem[];
}

export default function ThreePoints({ items }: ThreePointsProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const internClick = useCallback(
    (index: number) => {
      items[index].onClick();
      setOpen(false);
    },
    [items],
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <IconButton
          size="small"
          ref={buttonRef}
          onClick={() => setOpen(v => !v)}>
          <MoreHoriz fontSize="small" />
        </IconButton>
        <Popper
          open={open}
          anchorEl={buttonRef.current}
          popperOptions={{ placement: 'auto-start' }}
          transition>
          {({ TransitionProps }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <Fade {...TransitionProps}>
              <div className={s.popper}>
                {items.map((item, index) => (
                  <Tooltip
                    title={(item.disabled && item.disabledTooltip) || ''}>
                    <Button
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      variant="text"
                      disabled={item.disabled}
                      className={clsx({
                        [s.item]: true,
                        [s[item.style ?? 'normal']]: true,
                      })}
                      onClick={() => internClick(index)}>
                      {item.label}
                    </Button>
                  </Tooltip>
                ))}
                {items.length === 0 && (
                  <Button
                    // eslint-disable-next-line react/no-array-index-key
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
