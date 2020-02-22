import React from 'react';
import s from './index.module.css';
import IntervalChart, { FillModes } from '../../IntervalChart';
import API from '../../../../../services/API';
import Chart from '../../../../Chart';

class FeatRatioPer extends IntervalChart {
  constructor(props) {
    super(props, 'Average person number per song', FillModes.VOID);
  }

  dataGetter = stats => {
    if (stats === null) return 1;
    return stats.average;
  }

  fetchStats = async () => {
    const { start, end, timeSplit } = this.state;
    const { data } = await API.featRatio(start, end, timeSplit);

    return data;
  }

  getChartData = () => {
    const { stats } = this.state;

    return stats.map((stat, k) => ({ x: k, y: stat.data, date: stat._id }));
  }

  getContent = () => {
    const { start, end, timeSplit } = this.state;
    const data = this.getChartData();

    return (
      <Chart
        xName="Date"
        yName="Average person number per song"
        start={start}
        end={end}
        tValueFormat={value => `${Math.round(value * 10) / 10} people`}
        timeSplit={timeSplit}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        className={s.chart}
        data={data} />
    );
  }
}

export default FeatRatioPer;
