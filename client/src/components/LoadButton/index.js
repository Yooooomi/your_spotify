import React from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import s from './index.module.css';

function LoadButton({
  loading, disabled, children, ...other
}) {
  return (
    <Button disabled={loading || disabled} {...other}>
      { loading && <CircularProgress size={16} className={s.load} />}
      {children}
    </Button>
  );
}

export default LoadButton;
