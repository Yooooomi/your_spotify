import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { queryToIntervalDetail } from '../../services/intervals';
import { getAccounts } from '../../services/redux/modules/admin/thunk';
import { getSettings } from '../../services/redux/modules/settings/thunk';
import {
  setDataInterval,
  setPublicToken,
} from '../../services/redux/modules/user/reducer';
import {
  selectPublicToken,
  selectUser,
} from '../../services/redux/modules/user/selector';
import { checkLogged } from '../../services/redux/modules/user/thunk';
import { intervalDetailToRedux } from '../../services/redux/modules/user/utils';
import { useAppDispatch } from '../../services/redux/tools';

const GLOBAL_PREFIX = 'g';

export default function Wrapper() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const publicToken = useSelector(selectPublicToken);
  const [query, setQuery] = useSearchParams();

  const urlToken = useMemo(() => query.get('token'), [query]);

  useEffect(() => {
    dispatch(
      setDataInterval(
        intervalDetailToRedux(queryToIntervalDetail(query, GLOBAL_PREFIX)),
      ),
    );
    const fieldsToDelete = [
      'token',
      `${GLOBAL_PREFIX}type`,
      `${GLOBAL_PREFIX}start`,
      `${GLOBAL_PREFIX}end`,
      `${GLOBAL_PREFIX}name`,
    ];
    fieldsToDelete.forEach(field => query.delete(field));
    setQuery(query);
    // Only set the interval on the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    async function init() {
      await dispatch(setPublicToken(urlToken));
      await dispatch(checkLogged());
      await dispatch(getSettings());
    }
    if (!publicToken) {
      init().catch(console.error);
    }
  }, [dispatch, publicToken, urlToken]);

  useEffect(() => {
    async function init() {
      await dispatch(getAccounts());
    }
    if (user) {
      init().catch(console.error);
    }
  }, [dispatch, user]);

  return null;
}
