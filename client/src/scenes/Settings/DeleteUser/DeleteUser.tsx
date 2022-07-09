import { Button } from '@mui/material';
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Dialog from '../../../components/Dialog';
import LoadingButton from '../../../components/LoadingButton';
import { selectAccounts } from '../../../services/redux/modules/admin/selector';
import { deleteUser } from '../../../services/redux/modules/admin/thunk';
import { useAppDispatch } from '../../../services/redux/tools';
import SettingLine from '../SettingLine';
import s from './index.module.css';

export default function DeleteUser() {
  const dispatch = useAppDispatch();
  const accounts = useSelector(selectAccounts);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [beingDeleted, setBeingDeleted] = useState<string | null>(null);

  const askDelete = useCallback((id: string) => {
    setBeingDeleted(id);
    setOpen(true);
  }, []);

  const doDelete = useCallback(async () => {
    if (!beingDeleted) {
      return;
    }
    setLoading(true);
    await dispatch(deleteUser({ id: beingDeleted }));
    setLoading(false);
    setOpen(false);
  }, [beingDeleted, dispatch]);

  return (
    <div>
      <Dialog
        title="Are you sure you want to delete this user?"
        onClose={() => setOpen(false)}
        open={open}>
        This will delete every data of this user, including its history. There
        is no way to retrieve its data afterward.
        <div className={s.button}>
          <LoadingButton
            loading={loading}
            onClick={doDelete}
            color="error"
            variant="contained">
            Delete permanently
          </LoadingButton>
        </div>
      </Dialog>
      {accounts.map(user => (
        <SettingLine
          key={user.id}
          left={user.username}
          right={<Button onClick={() => askDelete(user.id)}>Delete</Button>}
        />
      ))}
    </div>
  );
}
