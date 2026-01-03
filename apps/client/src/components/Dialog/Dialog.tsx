import {
  Dialog as MDialog,
  DialogProps as MDialogProps,
  DialogContent,
  DialogTitle,
  Grow,
} from "@mui/material";

interface DialogProps extends MDialogProps {
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
  ...other
}: DialogProps) {
  return (
    <MDialog
      open={open}
      maxWidth="xl"
      onClose={onClose}
      TransitionComponent={Grow}
       
      {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </MDialog>
  );
}
