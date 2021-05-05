import React from 'react';
import s from './index.module.css';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import API from '../../../../../services/API';
import BasicChart from '../../BasicChart';

class BestArtists extends BasicChart {
  constructor(props) {
    super(props, 'Best artists');

    this.state.elementsShown = 7;
  }

  fetchStats = async () => {
    const { start, end } = this.state;
    const { data } = await API.mostListenedArtist(start, end, 'all');
    return data[0] || null;
  }

  onresized = () => {
    this.setState({ elementsShown: Math.max(1, Math.floor(this.getWidth() / 50)) });
  }

  getChartData = () => {
    const { stats } = this.state;
    const { counts } = stats;

    const { elementsShown } = this.state;
    const artists = stats.artists.slice(0, Math.min(stats.artists.length, elementsShown));

    const ret = artists.map((art, k) => ({
      x: k,
      y: counts[k],
      name: art.name,
    }));
    return ret;
  }

  getXFormat = value => {
    const { stats } = this.state;
    const art = stats.artists[value];

    return { name: art.name, url: art?.images[art.images.length - 1]?.url };
  }

  getYFormat = value => {
    const { user } = this.props;

    if (user.settings.metricUsed === 'duration') {
      return Math.floor(value / 1000 / 60);
    }
    if (user.settings.metricUsed === 'number') {
      return Math.floor(value);
    }
    return '';
  }

  tooltipFormatter = (value, __, { payload }) => {
    const { user } = this.props;
    const { y, name } = payload;

    if (user.settings.metricUsed === 'number') {
      return `Listened to ${name} ${y} time${y > 1 ? 's' : ''}`;
    }
    if (user.settings.metricUsed === 'duration') {
      const minutes = Math.floor(value / 1000 / 60);
      return `Listened to ${name} for ${minutes} minutes${minutes > 1 ? 's' : ''}`;
    }
    return '';
  }

  getContent = () => {
    const {
      stats, start, end, timeSplit,
    } = this.state;

    if (stats === null) return null;

    const data = this.getChartData();

    return (
      <SimpleLineChart
        tFormat={this.tooltipFormatter}
        xFormat={this.getXFormat}
        yFormat={this.getYFormat}
        xDomain={[0, data.length - 1]}
        type="bar"
        xName="Date"
        yName="Best artists"
        forceXToDisplay
        xIsImage
        start={start}
        end={end}
        timeSplit={timeSplit}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        className={s.chart}
        data={data}
      />
    );
  }
}

export default BestArtists;
