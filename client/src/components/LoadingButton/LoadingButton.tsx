import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import s from './index.module.css';

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  children,
  ...other
}: LoadingButtonProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button disabled={loading || disabled} {...other}>
      <div className={s.root}>
        {loading && <CircularProgress className={s.loading} size={16} />}
        <div>{children}</div>
      </div>
    </Button>
  );
}
