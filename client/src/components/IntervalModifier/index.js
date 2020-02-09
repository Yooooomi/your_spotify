import React from 'react';
import s from './index.module.css';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import cl from 'classnames';
// eslint-disable-next-line import/no-unresolved
import { Settings } from '@material-ui/icons';
import DateFnsUtils from '@date-io/date-fns';
import { Paper, Select, MenuItem, Popper, IconButton, } from '@material-ui/core';

function IntervalModifier({
  className,
  start,
  end,
  timeSplit,
  onStartChange,
  onEndChange,
  onTimeSplitChange,
  autoAbsolute = false,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <div className={cl(s.root, autoAbsolute && s.auto, className)}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <IconButton color="primary" onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}>
          <Settings />
        </IconButton>
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
                value={end}
                onChange={onEndChange}
                fullWidth
              />
            </div>
            <div className={s.entry}>
              {onTimeSplitChange &&
                <Select
                  fullWidth
                  value={timeSplit}
                  onChange={onTimeSplitChange}
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
  )
}

export default IntervalModifier;