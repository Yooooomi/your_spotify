import React from 'react';
import s from './index.module.css';
import IntervalChart, { FillModes } from '../../IntervalChart';
import API from '../../../../../services/API';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';

class PopularityPer extends IntervalChart {
  constructor(props) {
    super(props, 'Average song popularity', FillModes.VOID);
  }

  dataGetter = stats => {
    if (stats === null) return 0;
    return stats.totalPopularity;
  }

  fetchStats = async () => {
    const { start, end, timeSplit } = this.state;
    const { data } = await API.popularityPer(start, end, timeSplit);

    return data;
  }

  getChartData = () => {
    const { stats } = this.state;

    return stats.map((stat, k) => ({ x: k, y: stat.data, date: stat._id }));
  }

  getYFormat = value => `${value}%`;

  getContent = () => {
    const { start, end, timeSplit } = this.state;
    const data = this.getChartData();

    return (
      <SimpleLineChart
        xName="Date"
        yName="Average popularity"
        yFormat={this.getYFormat}
        start={start}
        end={end}
        timeSplit={timeSplit}
        tValueFormat={value => `${Math.floor(value)}% popularity`}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        className={s.chart}
        data={data}
      />
    );
  }
}

export default PopularityPer;
