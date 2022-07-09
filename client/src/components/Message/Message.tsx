import { IconButton, Snackbar, SnackbarCloseReason } from '@mui/material';
import { Close } from '@mui/icons-material';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertMessage } from '../../services/redux/modules/message/reducer';
import { selectMessage } from '../../services/redux/modules/message/selector';
import s from './index.module.css';
import Text from '../Text';

interface AlertProps {
  message: string;
  level: AlertMessage['level'];
  onClose: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ message, level, onClose }: AlertProps, ref) => (
    <div
      ref={ref}
      className={clsx({
        [s.alert]: true,
        [s[level]]: true,
      })}>
      <Text onDark>{message}</Text>
      <IconButton size="small" onClick={onClose}>
        <Close className={s.icon} fontSize="small" />
      </IconButton>
    </div>
  ),
);

export default function Message() {
  const message = useSelector(selectMessage);
  const [open, setOpen] = useState(false);

  const onClose = useCallback(
    (
      _: Event | React.SyntheticEvent<any, Event>,
      reason: SnackbarCloseReason,
    ) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
    },
    [],
  );

  useEffect(() => {
    setOpen(true);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
      <Alert
        onClose={() => setOpen(false)}
        level={message.level}
        message={message.message}
      />
    </Snackbar>
  );
}
