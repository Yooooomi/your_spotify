import React from 'react';
import s from './index.module.css';
import { lastWeek } from '../../../services/interval';

/*
* DataDisplayer is a class to hold an interval (start, end) and a timesplit
* It also calls refresh whenever it considers the props has changed and the values has to reload
* It does NOT implement a rendering
*/

class DataDisplayer extends React.Component {
  constructor(props, name) {
    super(props);

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

    if (!start || !end) {
      const thisWeek = lastWeek();

      start = thisWeek.start;
      end = thisWeek.end;
    }

    let diff = end.getTime() - start.getTime();
    diff /= Math.floor(1000 * 60 * 60 * 24); // Convert milliseconds to days

    // Previous end and previous start represent the a period of (end - start) days just before the start-end period
    // which gives something like [previousPeriod of n days][period of n days]

    const previousStart = new Date(start.getTime());
    previousStart.setDate(previousStart.getDate() - diff);

    const previousEnd = new Date(end.getTime());
    previousEnd.setDate(previousEnd.getDate() - diff);

    this.state = {
      start,
      end,
      previousStart,
      previousEnd,
      timeSplit: timeSplit || 'hour',
      stats: null,
    };
  }

  async componentDidMount() {
    if (!this.inited) {
      throw new Error('You must call parent constructor when using IntervalChart');
    }
    const { loaded } = this.props;

    if (!this.dontFetchOnMount) {
      await this.refresh();
      if (loaded) loaded();
    } else if (loaded) {
      loaded();
    }
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
}

export default DataDisplayer;
