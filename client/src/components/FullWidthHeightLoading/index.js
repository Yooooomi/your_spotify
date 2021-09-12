import { CircularProgress } from '@material-ui/core';
import React from 'react';
import s from './index.module.css';

function FullWidthHeightLoading() {
  return (
    <div className={s.root}>
      <CircularProgress />
    </div>
  );
}

export default FullWidthHeightLoading;
