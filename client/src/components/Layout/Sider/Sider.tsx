import React, { useCallback, useContext } from 'react';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import s from './index.module.css';
import { useShareLink } from '../../../services/hooks/hooks';
import { alertMessage } from '../../../services/redux/modules/message/reducer';
import { selectUser } from '../../../services/redux/modules/user/selector';
import { useAppDispatch } from '../../../services/redux/tools';
import { LayoutContext } from '../LayoutContext';
import SiderTitle from './SiderTitle';
import SiderSearch from '../../SiderSearch';
import { Artist, TrackWithFullAlbum } from '../../../services/types';
import SiderCategory from './SiderCategory/SiderCategory';
import { links } from './types';

interface SiderProps {
  className?: string;
  isDrawer?: boolean;
}

export default function Sider({ className, isDrawer }: SiderProps) {
  const dispatch = useAppDispatch();
  const layoutContext = useContext(LayoutContext);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();

  const goToArtist = useCallback(
    (artist: Artist) => {
      navigate(`/artist/${artist.id}`);
      layoutContext.closeDrawer();
    },
    [layoutContext, navigate],
  );

  const goToTrack = useCallback(
    (track: TrackWithFullAlbum) => {
      navigate(`/song/${track.id}`);
      layoutContext.closeDrawer();
    },
    [layoutContext, navigate],
  );

  const copyCurrentPage = useCallback(() => {
    if (!user?.publicToken) {
      dispatch(
        alertMessage({
          level: 'error',
          message:
            'No public token generated, go to the settings page to generate one',
        }),
      );
      return;
    }
    dispatch(
      alertMessage({
        level: 'info',
        message: 'Copied current page to clipboard with public token',
      }),
    );
  }, [dispatch, user?.publicToken]);

  const toCopy = useShareLink();

  if (!user) {
    return null;
  }

  return (
    <div className={clsx(s.root, className, { [s.drawer]: isDrawer })}>
      <div className={s.title}>
        <SiderTitle />
      </div>
      <SiderSearch onArtistClick={goToArtist} onTrackClick={goToTrack} />
      <nav>
        {links.map(category => (
          <SiderCategory
            key={category.label}
            user={user}
            pathname={location.pathname}
            onCopy={copyCurrentPage}
            toCopy={toCopy ?? ''}
            category={category}
          />
        ))}
      </nav>
    </div>
  );
}
