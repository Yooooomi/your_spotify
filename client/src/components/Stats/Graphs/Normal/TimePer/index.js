import React from 'react';
import s from './index.module.css';
import IntervalChart, { FillModes } from '../../IntervalChart';
import API from '../../../../../services/API';
import Chart from '../../../../Chart';

class TimePer extends IntervalChart {
  constructor(props) {
    super(props, 'Time listened', FillModes.ASK);
  }

  dataGetter = stats => {
    if (stats === null) return 0;
    return stats.count;
  }

  fetchStats = async () => {
    const { start, end, timeSplit } = this.state;
    const { data } = await API.timePer(start, end, timeSplit);

    return data;
  }

  getChartData = () => {
    const { stats } = this.state;

    return stats.map((stat, k) => ({ x: k, y: stat.data / 1000 / 60, date: stat._id }));
  }

  getContent = () => {
    const { start, end, timeSplit } = this.state;
    const data = this.getChartData();

    return (
      <Chart
        xName="Date"
        yName="Time listened"
        start={start}
        end={end}
        timeSplit={timeSplit}
        tValueFormat={value => `${Math.round(value)} minutes`}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        className={s.chart}
        data={data} />
    );
  }
}

export default TimePer;
