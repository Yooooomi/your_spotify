import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import cl from 'classnames';
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

export const FillModes = {
  ASK: 1,
  PREVIOUS_VALUE: 2,
  VOID: 3,
};

const fillArray = (stats, start, end, timeSplit, dataGetter, fillMode) => {
  const values = [];
  let tmp = new Date(start.getTime());
  let index = 0;

  while (tmp.getTime() < end.getTime()) {
    const fetched = index < stats.length && isGoodValue(stats[index]._id, tmp, timeSplit);

    if (fetched) {
      values.push({ data: dataGetter(stats[index]), _id: new Date(tmp.getTime()) });
      index += 1;
    } else if (fillMode === FillModes.ASK) {
      values.push({ data: dataGetter(null), _id: new Date(tmp.getTime()) });
    } else if (fillMode === FillModes.PREVIOUS_VALUE) {
      values.push({ data: dataGetter(stats[index - 1] || null), _id: new Date(tmp.getTime()) });
    } else if (fillMode === FillModes.VOID) {
      // Do nothing
    }
    tmp = addTimesplit(tmp, timeSplit);
  }
  return values;
};

class IntervalChart extends React.Component {
  constructor(props, name, fillMode = FillModes.ASK) {
    super(props);

    this.fillMode = fillMode;

    this.inited = true;
    this.name = name;

    let {
      start,
      end,
    } = this.props;

    const {
      timeSplit,
      dontFetchOnMount,
    } = this.props;

    this.dontFetchOnMount = dontFetchOnMount;

    if (!start) {
      start = new Date();
      start.setHours(0, 0, 0);
      start.setDate(start.getDate() - 5);
    }
    if (!end) {
      end = new Date();
    }

    this.state = {
      start,
      end,
      timeSplit: timeSplit || 'hour',
      stats: null,
    };
  }

  componentDidUpdate(prevProps) {
    const lastStart = prevProps.start;
    const lastEnd = prevProps.end;
    const { start } = this.props;
    const { end } = this.props;

    const lastSplit = prevProps.timeSplit;
    const split = this.props.timeSplit;

    const changes = {};

    if (
      (!lastStart && start)
      || (lastStart && start && lastStart.getTime() !== start.getTime())
    ) {
      changes.start = start;
    }

    if (
      (!lastEnd && end)
      || (lastEnd && end && lastEnd.getTime() !== end.getTime())
    ) {
      changes.end = end;
    }

    if (split && lastSplit !== split) {
      changes.timeSplit = split;
    }
    if (Object.keys(changes).length > 0) {
      this.setState(changes, this.refresh);
    }
  }

  dataGetter = () => {
    throw new Error('Implement data getter');
  }

  fetchStats = async () => {
    throw new Error('Implement fetch stats');
  }

  refresh = async (cb) => {
    const { start, end, timeSplit } = this.state;
    const data = await this.fetchStats();

    const values = fillArray(data, start, end, timeSplit, this.dataGetter, this.fillMode);

    if (values.length === 1) {
      values.push(values[0]);
    }

    this.setState({
      stats: values,
    }, cb);
  }

  setInfos = (field, value, shouldRefresh = true) => {
    this.setState({ [field]: value }, () => {
      if (!shouldRefresh) return;
      this.refresh();
    });
  }

  componentDidMount() {
    if (!this.inited) {
      throw new Error('You must call parent constructor when using IntervalChart');
    }
    const { loaded } = this.props;

    if (!this.dontFetchOnMount) {
      this.refresh(loaded);
    } else if (loaded) {
      loaded();
    }
  }

  getContent = () => {
    throw new Error('Implement get content');
  }

  render() {
    const { className } = this.props;
    const { stats } = this.state;
    if (!stats) return null;

    return (
      <Paper className={cl(s.paper, className)}>
        <Typography>{this.name}</Typography>
        {this.getContent()}
      </Paper>
    );
  }
}

export default IntervalChart;
