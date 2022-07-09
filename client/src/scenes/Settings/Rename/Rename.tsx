import React, { useCallback, useState } from 'react';
import { Button, Input } from '@mui/material';
import { changeUsername } from '../../../services/redux/modules/user/thunk';
import s from './index.module.css';
import { useAppDispatch } from '../../../services/redux/tools';

export default function Rename() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');

  const submit = useCallback(
    (ev: React.SyntheticEvent) => {
      ev.preventDefault();
      dispatch(changeUsername(name));
    },
    [name, dispatch],
  );

  return (
    <form onSubmit={submit} className={s.root}>
      <Input
        placeholder="New name..."
        fullWidth
        value={name}
        onChange={ev => setName(ev.target.value)}
      />
      <Button type="submit" variant="contained">
        Change
      </Button>
    </form>
  );
}
