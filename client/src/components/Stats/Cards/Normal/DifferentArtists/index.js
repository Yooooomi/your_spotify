import React from 'react';
import s from './index.module.css';
import API from '../../../../../services/API';
import { lastMonth } from '../../../../../services/interval';
import IntervalModifier from '../../../../IntervalModifier';
import { Typography } from '@material-ui/core';

class BestArtist extends React.Component {
  constructor(props) {
    super(props);

    const inter = lastMonth();

    this.state = {
      start: inter.start,
      end: inter.end,
      stats: null,
    };
  }

  onInterChange = (field, value) => {
    this.setState({
      [field]: value,
    }, this.refresh);
  }

  refresh = async () => {
    const { start, end } = this.state;

    const { data } = await API.differentArtistsPer(start, end);

    console.log('Artist', data);

    this.setState({
      stats: data,
    });
  }

  componentDidMount() {
    this.refresh();
  }

  render() {
    const { stats } = this.state;

    if (!stats) return null;

    return (
      <div className={s.root} style={{ backgroundImage: `url(${stats[0].artist.images[0].url})` }}>
        <IntervalModifier
          onStartChange={date => this.onInterChange('start', date)}
          onEndChange={date => this.onInterChange('end', date)}
          autoAbsolute
        />
        <div className={s.content}>
          <div className={s.text}>
            <div className={s.desc}>Best artist</div>
            <div className={s.title}>{stats[0].artist.name}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default BestArtist;
