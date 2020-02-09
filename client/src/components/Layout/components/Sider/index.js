import React from 'react';
import {
  List, ListItem, ListSubheader, ListItemIcon, ListItemText,
} from '@material-ui/core';
import {
  HomeOutlined, TimelineOutlined, SettingsOutlined, MeetingRoomOutlined, HistoryOutlined,
} from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import cl from 'classnames';
import s from './index.module.css';
import urls from '../../../../services/urls';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../../../services/redux/tools';

const SiderItems = [
  {
    label: 'Global',
    links: [
      { label: 'Overview', Icon: HomeOutlined, link: urls.home, needActivated: true },
      { label: 'Stats', Icon: TimelineOutlined, link: urls.history, needActivated: true },
      { label: 'History', Icon: HistoryOutlined, link: urls.history, needActivated: true },
    ],
  },
  {
    label: 'Account',
    links: [
      { label: 'Settings', Icon: SettingsOutlined, link: urls.settings, needActivated: false },
      { label: 'Logout', Icon: MeetingRoomOutlined, link: urls.logout, needActivated: false },
    ],
  },
];

class Sider extends React.Component {
    goto = url => this.props.history.push(url);

    render() {
      const { user, className } = this.props;

      return (
        <div className={cl(s.root, className)}>
          {
            SiderItems.map(part => (
              <List
                key={part.label}
                subheader={<ListSubheader>{part.label}</ListSubheader>}
              >
                {
                  part.links.map(link => (
                    <ListItem
                      key={link.label}
                      button
                      disabled={!user || (link.needActivated && !user.activated)}
                      onClick={() => this.goto(link.link)}
                    >
                      <ListItemIcon>
                        <link.Icon className={s.icon} />
                      </ListItemIcon>
                      <ListItemText primary={link.label} />
                    </ListItem>
                  ))
                }
              </List>
            ))
          }
        </div>
      );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Sider));
