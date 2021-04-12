import React from 'react';
import {
  Grid, Tabs, Tab, Typography, Select, MenuItem, useMediaQuery,
} from '@material-ui/core';
import s from './index.module.css';
import {
  lastMonth, lastDay, lastWeek, lastYear,
} from '../../services/interval';
import { lessThanMobile } from '../../services/theme';

const timeSplits = [
  'hour',
  'day',
  'month',
  'year',
];

const inters = [
  'Last day',
  'Last week',
  'Last month',
  'Last year',
];

function QuickInterval({
  interval,
  timeSplit,
  onChangeInterval,
  onChangeTimesplit,
}) {
  const mobile = useMediaQuery(lessThanMobile);

  return (
    <Grid container alignItems="center">
      <Grid item>
        {!mobile && (
          <Tabs
            value={interval}
            onChange={onChangeInterval}
          >
            {inters.map(e => <Tab label={e} key={e} />)}
          </Tabs>
        )}
        {mobile && (
          <Select
            className={s.select}
            onChange={ev => onChangeInterval(ev, ev.target.value)}
            value={interval}
          >
            {
              inters.map((e, k) => (
                <MenuItem key={e} value={k}><div className={s.menuItem}>{e}</div></MenuItem>
              ))
            }
          </Select>
        )}
      </Grid>
      <Grid item>
        <Typography className={s.every} align="center">every</Typography>
      </Grid>
      <Grid item>
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
