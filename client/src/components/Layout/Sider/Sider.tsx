import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { Paper, Popper } from '@mui/material';
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
} from '@mui/icons-material';
import s from './index.module.css';
import { useConditionalAPI, useShareLink } from '../../../services/hooks';
import { api } from '../../../services/api';
import { getImage } from '../../../services/tools';
import Text from '../../Text';
import { alertMessage } from '../../../services/redux/modules/message/reducer';
import { selectUser } from '../../../services/redux/modules/user/selector';
import { useAppDispatch } from '../../../services/redux/tools';

interface SiderProps {
  className?: string;
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
        link: '/settings',
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

export default function Sider({ className }: SiderProps) {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const results = useConditionalAPI(
    search.length >= 3,
    api.searchArtists,
    search,
  );

  const reset = useCallback(() => {
    setSearch('');
  }, []);

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
    <div className={clsx(s.root, className)}>
      <Link to="/" className={s.title}>
        <Text onDark element="h1">
          Your Spotify
        </Text>
      </Link>
      <input
        className={s.input}
        placeholder="Search..."
        value={search}
        onChange={ev => setSearch(ev.target.value)}
        ref={inputRef}
      />
      <Popper
        open={search.length > 0}
        anchorEl={inputRef.current}
        placement="bottom"
        className={s.popper}>
        <Paper
          className={s.results}
          style={{ width: inputRef.current?.clientWidth }}>
          {search.length < 3 && (
            <Text element="strong">At least 3 characters</Text>
          )}
          {results?.length === 0 && (
            <Text element="strong">No results found</Text>
          )}
          {results?.map(res => (
            <Link
              to={`/artist/${res.id}`}
              className={s.result}
              key={res.id}
              onClick={reset}>
              <img className={s.resultimage} src={getImage(res)} alt="Artist" />
              <Text element="strong">{res.name}</Text>
            </Link>
          ))}
        </Paper>
      </Popper>
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
                  <Link to={link.link} className={s.link} key={link.label}>
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
