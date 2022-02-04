import React from 'react';
import { CircularProgress } from '@mui/material';
import s from './index.module.css';

export default function Loader() {
  return (
    <div className={s.root}>
      <CircularProgress />
    </div>
  );
}
