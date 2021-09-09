import React from 'react';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import API from '../../../../../services/API';
import BasicChart from '../../BasicChart';

class HourOfDay extends BasicChart {
  constructor(props) {
    super(props, 'Listening repartition over day');
  }

  fetchStats = async () => {
    const { start, end } = this.state;
    const { data } = await API.timePerHourOfDay(start, end);

    const result = Array.from(Array(24).keys()).map((_, k) => ({ _id: k, count: 0 }));

    data.forEach(hour => {
      result[hour._id].count = hour.count; // Math.floor(hour.count / total * 100) / 100;
    });

    return result;
  }

  getChartData = () => {
    const { stats } = this.state;

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const result = Array.from(Array(24).keys()).map((_, k) => ({ x: k, y: 0 }));

    stats.forEach(hour => {
      result[hour._id].y = Math.floor((hour.count / total) * 100) / 100;
    });
    return result;
  }

  tooltipFormatter = (_, __, { payload }) => {
    const { user } = this.props;
    const { stats } = this.state;
    const { x } = payload;

    const value = stats[x]?.count || 0;
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const perc = Math.round((value / total) * 100);

    if (user.settings.metricUsed === 'number') {
      return `${x.toString().padStart(2, '0')}h, listened a total of ${value} songs, ${perc}% of the day average`;
    }
    if (user.settings.metricUsed === 'duration') {
      const minutes = Math.floor(value / 1000 / 60);
      return `${x.toString().padStart(2, '0')}h, listened a total of ${minutes} minutes, ${perc}% of the day average`;
    }
    return '';
  }

  getXFormat = value => {
    if (value % 2 === 0) {
      return `${value}h`;
    }
    return '';
  }

  getYFormat = value => `${Math.floor(value * 10000) / 100}%`;

  getContent = () => {
    const {
      stats, start, end, timeSplit,
    } = this.state;

    if (stats === null) return null;

    const data = this.getChartData();

    return (
      <SimpleLineChart
        forceXToDisplay
        xFormat={this.getXFormat}
        yFormat={this.getYFormat}
        tFormat={this.tooltipFormatter}
        type="bar"
        xName="Date"
        yName="Percentage"
        start={start}
        end={end}
        timeSplit={timeSplit}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        data={data}
      />
    );
  }
}

export default HourOfDay;
