import React from 'react';
import s from './index.module.css';
import IntervalChart, { FillModes } from '../../IntervalChart';
import API from '../../../../../services/API';
import Chart from '../../../../Chart';
import { formatDateFromYearDecimal } from '../../../../../services/date';

class AlbumDatePer extends IntervalChart {
  constructor(props) {
    super(props, 'Average album release date', FillModes.VOID);
  }

  dataGetter = stats => {
    if (stats === null) return 0;
    return stats.totalYear;
  }

  fetchStats = async () => {
    const { start, end, timeSplit } = this.state;
    const { data } = await API.albumDateRatio(start, end, timeSplit);

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
        yName="Average album release date"
        yDomain={[min => Number(min) - 1, max => Number(max) + 1]}
        start={start}
        end={end}
        tValueFormat={formatDateFromYearDecimal}
        timeSplit={timeSplit}
        yFormat={value => Math.trunc(value * 10) / 10}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        className={s.chart}
        data={data} />
    );
  }
}

export default AlbumDatePer;
