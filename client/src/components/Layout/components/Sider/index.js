import React from 'react';
import s from './index.module.css';
import { List, ListItem, ListSubheader, ListItemIcon, ListItemText } from '@material-ui/core';
import { HomeOutlined, TimelineOutlined, SettingsOutlined, MeetingRoomOutlined, HistoryOutlined } from '@material-ui/icons';
import { withRouter } from 'react-router-dom';
import urls from '../../../../services/urls';

const SiderItems = [
    {
        label: 'Global',
        links: [
            { label: 'Overview', Icon: HomeOutlined, link: urls.home },
            { label: 'Stats', Icon: TimelineOutlined, link: urls.history },
            { label: 'History', Icon: HistoryOutlined, link: urls.history },
        ]
    },
    {
        label: 'Account',
        links: [
            { label: 'Settings', Icon: SettingsOutlined, link: urls.settings },
            { label: 'Logout', Icon: MeetingRoomOutlined, link: urls.history },
        ]
    }
]

class Sider extends React.Component {
    goto = url => this.props.history.push(url);

    render() {
        return (
            <div className={s.root}>
                {
                    SiderItems.map(part => (
                        <List
                            subheader={<ListSubheader>{part.label}</ListSubheader>}
                        >
                            {
                                part.links.map(link => (
                                    <ListItem button onClick={() => this.goto(link.link)}>
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
        )
    }
}

export default withRouter(Sider);