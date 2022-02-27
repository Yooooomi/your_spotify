import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAccounts } from '../../services/redux/modules/admin/thunk';
import { getSettings } from '../../services/redux/modules/settings/thunk';
import { selectUser } from '../../services/redux/modules/user/selector';
import { checkLogged } from '../../services/redux/modules/user/thunk';

export default function Wrapper() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(checkLogged());
    dispatch(getSettings());
  }, [dispatch]);

  useEffect(() => {
    if (user && user.admin) {
      dispatch(getAccounts());
    }
  }, [user, dispatch]);

  return null;
}
