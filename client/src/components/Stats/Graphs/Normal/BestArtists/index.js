import React from 'react';
import s from './index.module.css';
import Chart from '../../../../Chart';
import API from '../../../../../services/API';
import BasicChart from '../../BasicChart';

class BestArtists extends BasicChart {
  constructor(props) {
    super(props, 'Best artists');
  }

  fetchStats = async () => {
    const { start, end } = this.state;
    const { data } = await API.mostListenedArtist(start, end, 'all');

    return data[0] || null;
  }

  getChartData = () => {
    const { stats } = this.state;
    const { counts } = stats;

    // So that it fits the screen
    stats.artists = stats.artists.slice(0, Math.min(stats.artists.length, 7));

    return stats.artists.map((art, k) => ({
      x: k,
      y: counts[k],
    }));
  }

  getXFormat = value => {
    const { stats } = this.state;

    return stats.artists[value].name;
  }

  getContent = () => {
    const {
      stats, start, end, timeSplit,
    } = this.state;

    if (stats === null) return null;

    const data = this.getChartData();

    return (
      <Chart
        xFormat={this.getXFormat}
        type='bar'
        xName="Date"
        yName="Different arists"
        start={start}
        end={end}
        timeSplit={timeSplit}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        className={s.chart}
        data={data} />
    );
  }
}

export default BestArtists;
