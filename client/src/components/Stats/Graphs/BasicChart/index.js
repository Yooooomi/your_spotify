import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core';
import cl from 'classnames';
import FullscreenIcon from '@material-ui/icons/ZoomIn';
import s from './index.module.css';
import { APICallStatus } from '../../../../services/hooks';
import FullWidthHeightLoading from '../../../FullWidthHeightLoading';

function getStatus(status) {
  const isArray = Array.isArray(status);
  if (isArray && status.some(e => e === APICallStatus.PENDING)) {
    return APICallStatus.PENDING;
  }
  if (!isArray) {
    return status;
  }
  return APICallStatus.FETCHED;
}

function BasicChart({
  name,
  className,
  children,
  stats,
  status,
  onResize,
}) {
  const [dialog, setDialog] = useState(false);
  const [contentRef, setContentRef] = useState(null);
  const [dialogRef, setDialogRef] = useState(null);

  useEffect(() => {
    let width = 0;
    if (dialog) {
      width = dialogRef?.clientWidth;
    } else {
      width = contentRef?.clientWidth;
    }
    onResize?.(width || 0);
  }, [contentRef, dialogRef, dialog, onResize]);

  const realStatus = getStatus(status);

  if (stats === null) {
    return (
      <div className={s.nostats}>
        <Typography variant="subtitle2">{name}</Typography>
        {realStatus === APICallStatus.PENDING && (
          <FullWidthHeightLoading />
        )}
        {realStatus === APICallStatus.FETCHED && (
          <div>
            Not enough data for this graph
          </div>
        )}
      </div>
    );
  }

  return (
    <Paper className={cl(s.paper, className)} ref={setContentRef}>
      <Dialog
        onClose={() => setDialog(false)}
        open={dialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <div ref={setDialogRef} className={s.dialogcontainer}>
            <Typography variant="subtitle2">{name}</Typography>
            {children}
          </div>
        </DialogContent>
      </Dialog>
      <div className={s.header}>
        <Typography variant="subtitle2">{name}</Typography>
        <IconButton onClick={() => setDialog(true)} size="small">
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </div>
      {children}
    </Paper>
  );
}

export default BasicChart;
