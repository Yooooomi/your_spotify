import React from 'react';
import {
  Dialog as MDialog,
  DialogContent,
  DialogTitle,
  Grow,
} from '@mui/material';

interface DialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function Dialog({
  open,
  onClose,
  title,
  children,
}: DialogProps) {
  return (
    <MDialog
      open={open}
      maxWidth="xl"
      onClose={onClose}
      TransitionComponent={Grow}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </MDialog>
  );
}
