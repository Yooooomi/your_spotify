import React from 'react';
import s from './index.module.css';
import { Grid, Tabs, Tab, Typography, Select, MenuItem } from '@material-ui/core';
import { lastMonth, lastDay, lastWeek, lastYear } from '../../services/interval';

const timeSplits = [
  'hour',
  'day',
  'month',
  'year',
];

const QuickInterval = ({
  interval,
  timeSplit,
  onChangeInterval,
  onChangeTimesplit,
}) => {
  return (
    <Grid container alignItems="center" justify="flex-end">
      <Grid item xs={12} lg="auto">
        <Tabs
          value={interval}
          onChange={onChangeInterval}
        >
          <Tab label="Last day" />
          <Tab label="Last week" />
          <Tab label="Last month" />
          <Tab label="Last year" />
        </Tabs>
      </Grid>
      <Grid item xs={12} lg="auto">
        <Typography className={s.every}>every</Typography>
      </Grid>
      <Grid item xs={12} lg="auto">
        <Select
          className={s.select}
          onChange={(ev) => onChangeTimesplit(ev.target.value)}
          value={timeSplit}
        >
          {
            timeSplits.map(e => (
              <MenuItem key={e} value={e}><div className={s.menuItem}>{e}</div></MenuItem>
            ))
          }
        </Select>
      </Grid>
    </Grid>
  );
}

export const PrefabToInter = [
  { name: 'day', fn: () => ({ inter: lastDay(), timeSplit: 'hour' }) },
  { name: 'week', fn: () => ({ inter: lastWeek(), timeSplit: 'day' }) },
  { name: 'month', fn: () => ({ inter: lastMonth(), timeSplit: 'day' }) },
  { name: 'year', fn: () => ({ inter: lastYear(), timeSplit: 'month' }) },
];

export default QuickInterval;
