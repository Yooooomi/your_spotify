import React from 'react';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import cl from 'classnames';
import DateFnsUtils from '@date-io/date-fns';
import {
  Paper, Select, MenuItem, Popper, Chip,
} from '@material-ui/core';
import s from './index.module.css';
import { setThisToMorning, setThisToEvening } from '../../services/interval';

function IntervalModifier({
  className,
  start,
  end,
  timeSplit,
  onStartChange = () => { },
  onEndChange = () => { },
  onTimeSplitChange = () => { },
  autoAbsolute = false,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <div className={cl(s.root, autoAbsolute && s.auto, className)}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Chip label="modify" size="small" variant="outlined" color="primary" onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)} />
        <Popper
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
        >
          <Paper className={s.paper}>
            <div className={s.entry}>
              <KeyboardDatePicker
                margin="none"
                label="From"
                variant="inline"
                format="MM/dd/yyyy"
                value={start}
                onChange={date => {
                  onStartChange(setThisToMorning(date));
                }}
                fullWidth
              />
            </div>
            <div className={s.entry}>
              <KeyboardDatePicker
                margin="none"
                label="To"
                variant="inline"
                format="MM/dd/yyyy"
                value={end}
                onChange={date => {
                  onEndChange(setThisToEvening(date));
                }}
                fullWidth
              />
            </div>
            <div className={s.entry}>
              {onTimeSplitChange
                && <Select
                  fullWidth
                  value={timeSplit}
                  onChange={e => onTimeSplitChange(e.target.value)}
                  label="Time split"
                >
                  <MenuItem value="hour">Hour</MenuItem>
                  <MenuItem value="day">day</MenuItem>
                  <MenuItem value="week">week</MenuItem>
                  <MenuItem value="month">month</MenuItem>
                  <MenuItem value="year">year</MenuItem>
                </Select>
              }
            </div>
          </Paper>
        </Popper>
      </MuiPickersUtilsProvider>
    </div>
  );
}

export default IntervalModifier;
