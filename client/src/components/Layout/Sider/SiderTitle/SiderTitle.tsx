import { Tooltip } from '@mui/material';
import { InfoOutlined as UpdateIcon } from '@mui/icons-material';
import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUpdateAvailable } from '../../../../services/redux/modules/settings/selector';
import { getVersion } from '../../../../services/redux/modules/settings/thunk';
import { useAppDispatch } from '../../../../services/redux/tools';
import Text from '../../../Text';
import s from './index.module.css';
import { LayoutContext } from '../../LayoutContext';

export default function UpdateChecker() {
  const layoutContext = useContext(LayoutContext);
  const dispatch = useAppDispatch();
  const updateAvailable = useSelector(selectUpdateAvailable);

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
      {updateAvailable && (
        <Tooltip title="An update is available">
          <a
            href="https://github.com/Yooooomi/your_spotify/releases"
            target="_blank"
            rel="noreferrer">
            <Text onDark>
              <UpdateIcon />
            </Text>
          </a>
        </Tooltip>
      )}
    </div>
  );
}
