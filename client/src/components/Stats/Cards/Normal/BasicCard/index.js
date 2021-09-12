import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';

function BasicCard({
  className,
  top,
  value,
  bottom,
}) {
  return (
    <Paper className={cl(s.root, className)}>
      <Typography variant="subtitle2" component="div">{top}</Typography>
      <Typography className={s.middle} variant="h4">{value}</Typography>
      <Typography component="div">{bottom}</Typography>
    </Paper>
  );
}

export default BasicCard;
