import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';
import API from '../../../../../services/API';

class TimeToday extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: null,
    };
  }

  async componentDidMount() {
    const start = new Date();
    start.setHours(0, 0, 0);
    const end = new Date();

    const { data } = await API.timePer(start, end, 'month');
    this.setState({
      stats: data[0] || { count: 0 },
    });
  }

  render() {
    const { className } = this.props;
    const { stats } = this.state;

    if (!stats) return null;

    return (
      <Paper className={cl(s.root, className)}>
        <Typography>You listened </Typography>
        <Typography variant="h1">{Math.floor(stats.count / 1000 / 60)}</Typography>
        <Typography>minutes of music today</Typography>
      </Paper>
    );
  }
}

export default TimeToday;
