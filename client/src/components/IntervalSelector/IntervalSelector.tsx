import { Settings } from '@mui/icons-material';
import {
  SelectProps,
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
import {
  cloneDate,
  startOfDay,
  getAppropriateTimesplitFromRange,
  endOfDay,
} from '../../services/date';
import {
  allIntervals,
  getAllIndexFromIntervalDetail,
  IntervalDetail,
  lastWeek,
  now,
} from '../../services/intervals';
import Dialog from '../Dialog';
import Text from '../Text';
import s from './index.module.css';

interface IntervalSelectorProps {
  value: IntervalDetail;
  onChange: (newDetails: IntervalDetail) => void;
  selectType?: SelectProps['variant'];
  forceTiny?: boolean;
}

export default function IntervalSelector({
  value,
  onChange,
  selectType,
  forceTiny,
}: IntervalSelectorProps) {
  const upmd = !useMediaQuery('(max-width: 1250px)') && !forceTiny;
  const [open, setOpen] = useState(false);
  const [customIntervalDate, setCustomIntervalDate] = useState<Range>({
    key: 'range',
    startDate: cloneDate(lastWeek),
    endDate: cloneDate(now),
    color: '#000000',
  });

  const existingInterval = useMemo(
    () => getAllIndexFromIntervalDetail(value),
    [value],
  );

  const internOnChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setOpen(true);
      } else {
        onChange(allIntervals[index]);
      }
    },
    [onChange],
  );

  let content: React.ReactNode;

  if (!upmd) {
    content = (
      <Select
        variant={selectType}
        value={existingInterval}
        onChange={ev => internOnChange(ev.target.value as number)}>
        {allIntervals.map((inter, index) => (
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
          onChange={ev => internOnChange(ev.target.value as unknown as number)}
          name="interval radio group">
          {allIntervals.map((inter, index) => (
            <FormControlLabel
              key={inter.name}
              value={index}
              control={<Radio />}
              label={<Text>{inter.name}</Text>}
            />
          ))}
        </RadioGroup>
        <IconButton size="small" onClick={() => setOpen(true)}>
          <Settings
            style={{ color: existingInterval === -1 ? '#000000' : undefined }}
          />
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
      type: 'custom',
      name: 'custom',
      interval: {
        start: startOfDay(customIntervalDate.startDate),
        end: endOfDay(customIntervalDate.endDate),
        timesplit: getAppropriateTimesplitFromRange(
          customIntervalDate.startDate,
          customIntervalDate.endDate,
        ),
      },
    });
    setOpen(false);
  }, [customIntervalDate, onChange]);

  return (
    <>
      {content}
      <Dialog
        title="Custom date range"
        open={open}
        onClose={() => setOpen(false)}>
        <div className={s.dialogcontent}>
          <div>
            <DateRangePicker
              ranges={[customIntervalDate]}
              onChange={onCustomChange}
            />
          </div>
          <Button variant="contained" onClick={setCustom} disabled={!goodRange}>
            Apply
          </Button>
        </div>
      </Dialog>
    </>
  );
}
