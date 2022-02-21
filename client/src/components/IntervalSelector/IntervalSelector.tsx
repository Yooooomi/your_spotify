import { Settings } from '@material-ui/icons';
import {
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  useMediaQuery,
} from '@mui/material';
import React, { useState, useCallback, useMemo } from 'react';
import { DateRangePicker, Range, RangeKeyDict } from 'react-date-range';
import { cloneDate, getAppropriateTimesplitFromRange } from '../../services/date';
import { Interval, Timesplit } from '../../services/types';
import Dialog from '../Dialog';
import s from './index.module.css';

interface IntervalSelectorProps {
  value: IntervalDetail;
  onChange: (newDetails: IntervalDetail) => void;
}

const lastDay = new Date();
lastDay.setDate(lastDay.getDate() - 1);
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
const lastYear = new Date();
lastYear.setFullYear(lastYear.getFullYear() - 1);
const now = new Date();

export interface IntervalDetail {
  name: string;
  unit: string;
  interval: Interval;
  index?: number;
}

export const intervals: IntervalDetail[] = [
  {
    index: 0,
    name: 'Last day',
    unit: 'day',
    interval: { timesplit: Timesplit.hour, start: lastDay, end: now },
  },
  {
    index: 1,
    name: 'Last week',
    unit: 'week',
    interval: { timesplit: Timesplit.day, start: lastWeek, end: now },
  },
  {
    index: 2,
    name: 'Last month',
    unit: 'month',
    interval: { timesplit: Timesplit.day, start: lastMonth, end: now },
  },
  {
    index: 3,
    name: 'Last year',
    unit: 'year',
    interval: { timesplit: Timesplit.month, start: lastYear, end: now },
  },
];

export default function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  const upmd = !useMediaQuery('(max-width: 1250px)');
  const [open, setOpen] = useState(false);
  const [customIntervalDate, setCustomIntervalDate] = useState<Range>({
    key: 'range',
    startDate: cloneDate(lastWeek),
    endDate: cloneDate(now),
    color: '#000000',
  });

  const existingInterval = useMemo(() => {
    return value.index ?? -1;
  }, [value]);

  const internOnChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setOpen(true);
      } else {
        onChange(intervals[index]);
      }
    },
    [onChange],
  );

  let content: React.ReactNode;

  if (!upmd) {
    content = (
      <Select value={existingInterval} onChange={(ev) => internOnChange(ev.target.value as number)}>
        {intervals.map((inter, index) => (
          <MenuItem key={inter.name} value={index}>
            {inter.name}
          </MenuItem>
        ))}
        <MenuItem value={-1} onClick={() => setOpen(true)}>
          Custom
        </MenuItem>
      </Select>
    );
  } else {
    content = (
      <div className={s.radiogroup}>
        <RadioGroup
          row
          value={existingInterval}
          onChange={(ev) => internOnChange(ev.target.value as unknown as number)}
          name="interval radio group">
          {intervals.map((inter, index) => (
            <FormControlLabel
              key={inter.name}
              value={index}
              control={<Radio />}
              label={inter.name}
            />
          ))}
        </RadioGroup>
        <IconButton size="small" onClick={() => setOpen(true)}>
          <Settings style={{ color: existingInterval === -1 ? '#000000' : undefined }} />
        </IconButton>
      </div>
    );
  }

  const onCustomChange = useCallback((a: RangeKeyDict) => {
    setCustomIntervalDate(a.range);
  }, []);

  const goodRange = useMemo(
    () => Boolean(customIntervalDate.startDate && customIntervalDate.endDate),
    [customIntervalDate.endDate, customIntervalDate.startDate],
  );

  const setCustom = useCallback(() => {
    if (!customIntervalDate.startDate || !customIntervalDate.endDate) {
      return;
    }
    onChange({
      interval: {
        start: cloneDate(customIntervalDate.startDate),
        end: cloneDate(customIntervalDate.endDate),
        timesplit: getAppropriateTimesplitFromRange(
          customIntervalDate.startDate,
          customIntervalDate.endDate,
        ),
      },
      name: 'custom',
      unit: 'period',
    });
    setOpen(false);
  }, [customIntervalDate, onChange]);

  return (
    <>
      {content}
      <Dialog title="Custom date range" open={open} onClose={() => setOpen(false)}>
        <div className={s.dialogcontent}>
          <div>
            <DateRangePicker ranges={[customIntervalDate]} onChange={onCustomChange} />
          </div>
          <Button variant="contained" onClick={setCustom} disabled={!goodRange}>
            Apply
          </Button>
        </div>
      </Dialog>
    </>
  );
}
