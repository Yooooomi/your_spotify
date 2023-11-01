import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVersion } from '../../../../services/redux/modules/settings/thunk';
import { useAppDispatch } from '../../../../services/redux/tools';
import Text from '../../../Text';
import s from './index.module.css';
import { LayoutContext } from '../../LayoutContext';

export default function UpdateChecker() {
  const layoutContext = useContext(LayoutContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getVersion());
  }, [dispatch]);

  return (
    <div className={s.root}>
      <Link to="/" onClick={layoutContext.closeDrawer}>
        <Text onDark element="h1">
          Your Spotify
        </Text>
      </Link>
    </div>
  );
}
