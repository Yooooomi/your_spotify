import React, { useCallback, useContext } from 'react';
import clsx from 'clsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Home,
  HomeOutlined,
  BarChart,
  BarChartOutlined,
  MusicNote,
  MusicNoteOutlined,
  Album,
  AlbumOutlined,
  Person,
  PersonOutlined,
  Settings,
  SettingsOutlined,
  ExitToApp,
  Share,
  ShareOutlined,
  Speed,
  SpeedOutlined,
} from '@mui/icons-material';
import s from './index.module.css';
import { useShareLink } from '../../../services/hooks/hooks';
import Text from '../../Text';
import { alertMessage } from '../../../services/redux/modules/message/reducer';
import { selectUser } from '../../../services/redux/modules/user/selector';
import { useAppDispatch } from '../../../services/redux/tools';
import { LayoutContext } from '../LayoutContext';
import SiderTitle from './SiderTitle';
import SiderSearch from '../../SiderSearch';
import { Artist, TrackWithFullAlbum } from '../../../services/types';

interface SiderProps {
  className?: string;
  isDrawer?: boolean;
}

const links = [
  {
    label: 'General',
    items: [
      {
        label: 'Home',
        link: '/',
        icon: <HomeOutlined />,
        iconOn: <Home />,
      },
      {
        label: 'Longest sessions',
        link: '/sessions',
        icon: <SpeedOutlined />,
        iconOn: <Speed />,
      },
      {
        label: 'All stats',
        link: '/all',
        icon: <BarChartOutlined />,
        iconOn: <BarChart />,
      },
    ],
  },
  {
    label: 'Tops',
    items: [
      {
        label: 'Top songs',
        link: '/top/songs',
        icon: <MusicNoteOutlined />,
        iconOn: <MusicNote />,
      },
      {
        label: 'Top artists',
        link: '/top/artists',
        icon: <PersonOutlined />,
        iconOn: <Person />,
      },
      {
        label: 'Top albums',
        link: '/top/albums',
        icon: <AlbumOutlined />,
        iconOn: <Album />,
      },
    ],
  },
  {
    label: 'With people',
    items: [
      {
        label: 'Affinity',
        link: '/collaborative/affinity',
        icon: <MusicNoteOutlined />,
        iconOn: <MusicNote />,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Share this page',
        link: '/share',
        icon: <ShareOutlined />,
        iconOn: <Share />,
      },
      {
        label: 'Settings',
        link: '/settings/account',
        icon: <SettingsOutlined />,
        iconOn: <Settings />,
      },
      {
        label: 'Logout',
        link: '/logout',
        icon: <ExitToApp />,
        iconOn: <ExitToApp />,
      },
    ],
  },
];

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

  return (
    <div className={clsx(s.root, className, { [s.drawer]: isDrawer })}>
      <div className={s.title}>
        <SiderTitle />
      </div>
      <SiderSearch onArtistClick={goToArtist} onTrackClick={goToTrack} />
      <nav>
        {links.map(category => (
          <div className={s.category} key={category.label}>
            <Text element="div" onDark className={s.categoryname}>
              {category.label}
            </Text>
            {toCopy &&
              category.items.map(link => {
                if (link.link === '/share') {
                  return (
                    <CopyToClipboard
                      key={link.label}
                      onCopy={copyCurrentPage}
                      text={toCopy}>
                      <div className={s.link} key={link.label}>
                        <Text onDark>
                          {location.pathname === link.link
                            ? link.iconOn
                            : link.icon}
                        </Text>
                        <Text onDark>{link.label}</Text>
                      </div>
                    </CopyToClipboard>
                  );
                }
                return (
                  <Link
                    to={link.link}
                    className={s.link}
                    key={link.label}
                    onClick={layoutContext.closeDrawer}>
                    <Text onDark>
                      {location.pathname === link.link
                        ? link.iconOn
                        : link.icon}
                    </Text>
                    <Text onDark>{link.label}</Text>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
    </div>
  );
}
