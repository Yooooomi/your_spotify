import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { Paper, Popper } from '@material-ui/core';
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
} from '@material-ui/icons';
import s from './index.module.css';
import { useConditionalAPI } from '../../../services/hooks';
import { api } from '../../../services/api';
import { getImage } from '../../../services/tools';

interface SiderProps {
  className?: string;
}

const links = [
  {
    label: 'General',
    items: [
      { label: 'Home', link: '/', icon: <HomeOutlined />, iconOn: <Home /> },
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
    label: 'Settings',
    items: [
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
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const results = useConditionalAPI(search.length >= 3, api.searchArtists, search);

  const reset = useCallback(() => {
    setSearch('');
  }, []);

  return (
    <div className={clsx(s.root, className)}>
      <h1 className={s.title}>Your Spotify</h1>
      <input
        className={s.input}
        placeholder="Search..."
        value={search}
        onChange={(ev) => setSearch(ev.target.value)}
        ref={inputRef}
      />
      <Popper
        open={search.length > 0}
        anchorEl={inputRef.current}
        placement="bottom"
        className={s.popper}>
        <Paper className={s.results} style={{ width: inputRef.current?.clientWidth }}>
          {search.length < 3 && <strong>At least 3 characters</strong>}
          {results?.length === 0 && <strong>No results found</strong>}
          {results?.map((res) => (
            <Link to={`/artist/${res.id}`} className={s.result} key={res.id} onClick={reset}>
              <img className={s.resultimage} src={getImage(res)} alt="Artist" />
              <strong>{res.name}</strong>
            </Link>
          ))}
        </Paper>
      </Popper>
      <nav>
        {links.map((category) => (
          <div className={s.category} key={category.label}>
            <div className={s.categoryname}>{category.label}</div>
            {category.items.map((link) => (
              <Link to={link.link} className={s.link} key={link.label}>
                <span>{location.pathname === link.link ? link.iconOn : link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
