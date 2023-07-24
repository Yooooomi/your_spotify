import { ReactNode } from 'react';
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

export interface SiderLink {
  label: string;
  link: string;
  icon: ReactNode;
  iconOn: ReactNode;
  restrict?: 'guest';
}

export interface SiderCategory {
  label: string;
  items: SiderLink[];
}

export const links: SiderCategory[] = [
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
        restrict: 'guest',
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
