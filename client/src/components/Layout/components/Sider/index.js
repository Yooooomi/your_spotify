import React from 'react';
import {
  List, ListItem, ListSubheader, ListItemIcon, ListItemText, Drawer, withWidth, isWidthDown,
} from '@material-ui/core';
import {
  HomeOutlined, TimelineOutlined, SettingsOutlined, MeetingRoomOutlined, HistoryOutlined,
} from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import cl from 'classnames';
import { connect } from 'react-redux';
import s from './index.module.css';
import urls from '../../../../services/urls';
import { mapStateToProps, mapDispatchToProps } from '../../../../services/redux/tools';

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

class Sider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerOpen: false,
    };
  }

  openDrawer = status => () => {
    this.setState({
      drawerOpen: status,
    });
  }

  componentDidMount() {
    window.openDrawer = this.openDrawer(true);
  }

  goto = url => this.props.history.push(url);

  getSider = () => {
    const { user } = this.props;

    return SiderItems.map(part => (
      <List
        key={part.label}
        subheader={<ListSubheader className={s.siderHeader}>{part.label}</ListSubheader>}
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
              <ListItemText style={{ color: 'white' }} primary={link.label} />
            </ListItem>
          ))
        }
      </List>
    ));
  }

  render() {
    const { drawerOpen } = this.state;
    const { className, width } = this.props;

    const useDrawer = isWidthDown('md', width, false);
    const siderContent = this.getSider();

    if (useDrawer) {
      return (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={this.openDrawer(false)}
        >
          <div className={s.mobileDrawer}>
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
}

export default withWidth()(connect(mapStateToProps, mapDispatchToProps)(withRouter(Sider)));
