import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import SettingLine from '../SettingLine';
import { setAdmin } from '../../../services/redux/modules/admin/thunk';
import { selectAccounts } from '../../../services/redux/modules/admin/selector';
import { useAppDispatch } from '../../../services/redux/tools';
import TitleCard from '../../../components/TitleCard';
import { alertMessage } from '../../../services/redux/modules/message/reducer';

export default function SetAdmin() {
  const dispatch = useAppDispatch();
  const accounts = useSelector(selectAccounts);

  const doAdmin = useCallback(
    async (id: string, status: boolean) => {
      try {
        dispatch(setAdmin({ id, status }));
      } catch (e: any) {
        if (e?.response?.data?.code === 'CANNOT_HAVE_ZERO_ADMIN') {
          dispatch(
            alertMessage({
              level: 'error',
              message:
                'Cannot have less than one administrator of the platform',
            }),
          );
        }
        console.error(e);
      }
    },
    [dispatch],
  );

  return (
    <TitleCard title="Set admin status">
      {accounts.map(user => (
        <SettingLine
          key={user.id}
          left={user.username}
          right={
            <Button onClick={() => doAdmin(user.id, !user.admin)}>
              {user.admin ? 'Unset admin' : 'Set admin'}
            </Button>
          }
        />
      ))}
    </TitleCard>
  );
}
