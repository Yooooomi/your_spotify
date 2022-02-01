import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSettings } from '../../services/redux/modules/settings/thunk';
import { checkLogged } from '../../services/redux/modules/user/thunk';

export default function Wrapper() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkLogged());
    dispatch(getSettings());
  }, [dispatch]);

  return null;
}
