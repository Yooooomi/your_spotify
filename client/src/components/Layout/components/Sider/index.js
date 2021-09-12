import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  List, ListItem, ListSubheader, ListItemIcon, ListItemText, Drawer, Typography, useMediaQuery,
} from '@material-ui/core';
import {
  HomeOutlined, TimelineOutlined, SettingsOutlined, MeetingRoomOutlined, HistoryOutlined,
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import cl from 'classnames';
import { useSelector } from 'react-redux';

import AlbumIcon from '@material-ui/icons/Album';
import SongIcon from '@material-ui/icons/Audiotrack';
import ArtistIcon from '@material-ui/icons/Person';

import s from './index.module.css';
import urls from '../../../../services/urls';
import { selectUser } from '../../../../services/redux/selector';
import { lessThanTablet } from '../../../../services/theme';

const SiderItems = [
  {
    label: 'Global',
    links: [
      {
        label: 'Overview', Icon: HomeOutlined, link: urls.home, needActivated: true,
      },
      {
        label: 'Stats', Icon: TimelineOutlined, link: urls.allStats, needActivated: true,
      },
      {
        label: 'History', Icon: HistoryOutlined, link: urls.history, needActivated: true,
      },
    ],
  },
  {
    label: 'Tops',
    links: [
      {
        label: 'Top artists', Icon: ArtistIcon, link: urls.topArtists, needActivated: true,
      },
      {
        label: 'Top Albums', Icon: AlbumIcon, link: urls.topAlbums, needActivated: true,
      },
      {
        label: 'Top songs', Icon: SongIcon, link: urls.topSongs, needActivated: true,
      },
    ],
  },
  {
    label: 'Account',
    links: [
      {
        label: 'Settings', Icon: SettingsOutlined, link: urls.settings, needActivated: false,
      },
      {
        label: 'Logout', Icon: MeetingRoomOutlined, link: urls.logout, needActivated: false,
      },
    ],
  },
];

function Sider({ className }) {
  const user = useSelector(selectUser);
  const history = useHistory();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    window.openDrawer = () => setDrawerOpen(true);
  }, []);

  const goto = useCallback(url => {
    history.push(url);
  }, [history]);

  const siderContent = useMemo(() => SiderItems.map(part => (
    <List
      key={part.label}
      component="nav"
      subheader={<ListSubheader disableSticky className={s.siderHeader}>{part.label}</ListSubheader>}
    >
      {
        part.links.map(link => (
          <ListItem
            key={link.label}
            button
            disabled={!user || (link.needActivated && !user.activated)}
            onClick={() => goto(link.link)}
          >
            <ListItemIcon>
              <link.Icon className={s.icon} />
            </ListItemIcon>
            <ListItemText style={{ color: 'white' }} primary={link.label} />
          </ListItem>
        ))
      }
    </List>
  )), [goto, user]);

  const useDrawer = useMediaQuery(lessThanTablet);

  if (useDrawer) {
    return (
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className={s.mobileDrawer}>
          <Typography variant="h4" className={s.title}>
            Your Spotify
          </Typography>
          {siderContent}
        </div>
      </Drawer>
    );
  }

  return (
    <div className={cl(s.root, className)}>
      {siderContent}
    </div>
  );
}

export default Sider;
