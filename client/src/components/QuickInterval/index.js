import React, { useCallback, useState } from 'react';
import {
  Grid, Tabs, Tab, Select, MenuItem, useMediaQuery, Dialog,
} from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import CustomIcon from '@material-ui/icons/Settings';
import s from './index.module.css';
import {
  lastMonth, lastDay, lastWeek, lastYear, setThisToMorning, setThisToEvening,
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

export const PrefabToInter = [
  { name: 'day', fn: () => ({ inter: lastDay(), timeSplit: 'hour' }) },
  { name: 'week', fn: () => ({ inter: lastWeek(), timeSplit: 'day' }) },
  { name: 'month', fn: () => ({ inter: lastMonth(), timeSplit: 'day' }) },
  { name: 'year', fn: () => ({ inter: lastYear(), timeSplit: 'month' }) },
];

function QuickInterval({
  defaultTab,
  interval,
  timeSplit,
  onChangeInterval,
  onChangeTimesplit,
}) {
  const mobile = useMediaQuery(lessThanMobile);
  const [tabIndex, setTabIndex] = useState(defaultTab || 0);
  const [open, setOpen] = useState(false);

  const onStartChange = useCallback((date) => {
    date = setThisToMorning(date);
    const newInterval = { ...interval, start: date };
    onChangeInterval(newInterval);
  }, [interval, onChangeInterval]);

  const onEndChange = useCallback((date) => {
    date = setThisToEvening(date);
    const newInterval = { ...interval, end: date };
    onChangeInterval(newInterval);
  }, [interval, onChangeInterval]);

  const changeTabIndex = useCallback((ev, value) => {
    if (value === inters.length) {
      setOpen(true);
    } else {
      onChangeInterval(PrefabToInter[value].fn().inter, value);
      onChangeTimesplit?.(PrefabToInter[value].fn().timeSplit);
    }
    setTabIndex(value);
  }, [onChangeTimesplit, onChangeInterval]);

  return (
    <Grid container alignItems="center" className={s.root}>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <div className={s.dialog}>
            <div className={s.entry}>
              <KeyboardDatePicker
                margin="none"
                label="From"
                variant="inline"
                format="MM/dd/yyyy"
                value={interval.start}
                onChange={onStartChange}
                fullWidth
              />
            </div>
            <div className={s.entry}>
              <KeyboardDatePicker
                margin="none"
                label="To"
                variant="inline"
                format="MM/dd/yyyy"
                value={interval.end}
                onChange={onEndChange}
                fullWidth
              />
            </div>
            {timeSplit && (
              <div>
                <span>
                  Data split every
                </span>
                <Select
                  className={s.select}
                  onChange={ev => onChangeTimesplit(ev.target.value)}
                  value={timeSplit}
                >
                  {
                    timeSplits.map(e => (
                      <MenuItem key={e} value={e}><div className={s.menuItem}>{e}</div></MenuItem>
                    ))
                  }
                </Select>
              </div>
            )}
          </div>
        </MuiPickersUtilsProvider>
      </Dialog>
      <Grid item>
        {!mobile && (
          <Tabs
            value={tabIndex}
            onChange={changeTabIndex}
          >
            {inters.map(e => <Tab label={e} key={e} />)}
            <Tab className={s.custom} label={<CustomIcon />} />
          </Tabs>
        )}
        {mobile && (
          <Select
            className={s.select}
            onChange={ev => changeTabIndex(ev, ev.target.value)}
            value={tabIndex}
          >
            {
              inters.map((e, k) => (
                <MenuItem key={e} value={k}><div className={s.menuItem}>{e}</div></MenuItem>
              ))
            }
            <MenuItem value={inters.length}><div className={s.menuItem}>Custom</div></MenuItem>
          </Select>
        )}
      </Grid>
    </Grid>
  );
}

export default QuickInterval;
