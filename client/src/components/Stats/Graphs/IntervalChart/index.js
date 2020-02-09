import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import s from './index.module.css';

const getWeek = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const addTimesplit = (date, timeSplit, multiplier = 1) => {
  if (timeSplit === 'hour') date.setHours(date.getHours() + 1 * multiplier);
  else if (timeSplit === 'day') date.setDate(date.getDate() + 1 * multiplier);
  else if (timeSplit === 'week') date.setDate(date.getDate() + 7 * multiplier);
  else if (timeSplit === 'month') date.setMonth(date.getMonth() + 1 * multiplier);
  else if (timeSplit === 'year') date.setFullYear(date.getFullYear() + 1 * multiplier);
  return date;
};

const isGoodValue = (stat, date, timeSplit) => {
  const datas = {
    hour: date.getHours(),
    day: date.getDate(),
    week: getWeek(date),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };

  if (timeSplit === 'hour') return stat.year === datas.year && stat.month === datas.month && stat.day === datas.day && stat.hour === datas.hour;
  if (timeSplit === 'day') return stat.year === datas.year && stat.month === datas.month && stat.day === datas.day;
  if (timeSplit === 'week') return stat.year === datas.year && stat.week === datas.week;
  if (timeSplit === 'month') return stat.year === datas.year && stat.month === datas.month;
  if (timeSplit === 'year') return stat.year === datas.year;
  return false;
};

const fillArray = (stats, start, end, timeSplit, dataGetter) => {
  const values = [];
  let tmp = new Date(start.getTime());
  let index = 0;

  while (tmp.getTime() < end.getTime()) {
    const fetched = index < stats.length && isGoodValue(stats[index]._id, tmp, timeSplit);

    if (fetched) {
      values.push({ data: dataGetter(stats[index]), _id: new Date(tmp.getTime()) });
      index += 1;
    } else {
      values.push({ data: dataGetter(null), _id: new Date(tmp.getTime()) });
    }
    tmp = addTimesplit(tmp, timeSplit);
  }
  return values;
};

class IntervalChart extends React.Component {
  init = (name = '', timeSplit = 'hour', start = null, end = null, fetchOnMount = true) => {
    this.inited = true;
    this.name = name;

    if (start === null) {
      start = new Date();
      start.setHours(0, 0, 0);
      start.setDate(start.getDate() - 5);
    }
    if (end === null) {
      end = new Date();
    }

    this.fetchOnMount = fetchOnMount;

    // eslint-disable-next-line react/no-direct-mutation-state
    this.state = {
      start,
      end,
      stats: null,
      timeSplit,
    };
  }

  dataGetter = () => {
    throw new Error('Implement data getter');
  }

  fetchStats = async () => {
    throw new Error('Implement fetch stats');
  }

  refresh = async () => {
    const { start, end, timeSplit } = this.state;
    const data = await this.fetchStats();

    const values = fillArray(data, start, end, timeSplit, this.dataGetter);

    if (values.length === 1) {
      values.push(values[0]);
    }

    this.setState({
      stats: values,
    });
  }

  setInfos = (field, value, shouldRefresh = true) => {
    this.setState({ [field]: value }, () => {
      if (!shouldRefresh) return;
      this.refresh();
    });
  }

  componentDidMount() {
    if (!this.inited) {
      throw new Error('You must init the Interval chart in the constructor');
    }
    if (this.fetchOnMount) {
      this.refresh();
    }
  }

  getContent = () => {
    throw new Error('Implement get content');
  }

  render() {
    const { stats } = this.state;
    if (!stats) return null;

    return (
      <Paper className={s.paper}>
        <Typography>{this.name}</Typography>
        {this.getContent()}
      </Paper>
    );
  }
}

export default IntervalChart;
