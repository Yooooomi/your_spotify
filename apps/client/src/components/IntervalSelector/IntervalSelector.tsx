import { Settings, SettingsOutlined } from "@mui/icons-material";
import {
  SelectProps,
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import React, { useState, useCallback, useMemo } from "react";
import { endOfDay, startOfDay } from "date-fns";
import { getAppropriateTimesplitFromRange } from "../../services/date";
import { useMobile } from "../../services/hooks/hooks";
import {
  allIntervals,
  getAllIndexFromIntervalDetail,
  IntervalDetail,
} from "../../services/intervals";
import Dialog from "../Dialog";
import Text from "../Text";
import s from "./index.module.css";
import RangePicker from "./RangePicker";
import { Range } from "./RangePicker/RangePicker";

interface IntervalSelectorProps {
  value: IntervalDetail;
  onChange: (newDetails: IntervalDetail) => void;
  selectType?: SelectProps["variant"];
  forceTiny?: boolean;
}

export function IntervalSelector({
  value,
  onChange,
  selectType,
  forceTiny,
}: IntervalSelectorProps) {
  const upmd = !useMobile()[1] && !forceTiny;
  const [open, setOpen] = useState(false);
  const [customIntervalDate, setCustomIntervalDate] = useState<Range>([
    undefined,
    undefined,
  ]);

  const existingInterval = useMemo(
    () => getAllIndexFromIntervalDetail(value),
    [value],
  );

  const internOnChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setOpen(true);
      } else {
        const interval = allIntervals[index];
        if (!interval) {
          return;
        }
        onChange(interval);
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
          {existingInterval === -1 ? <Settings /> : <SettingsOutlined />}
        </IconButton>
      </div>
    );
  }

  const goodRange = useMemo(
    () => Boolean(customIntervalDate[0] && customIntervalDate[1]),
    [customIntervalDate],
  );

  const setCustom = useCallback(() => {
    const [start, end] = customIntervalDate;
    if (!start || !end) {
      return;
    }
    onChange({
      type: "custom",
      name: "custom",
      interval: {
        start: startOfDay(start),
        end: endOfDay(end),
        timesplit: getAppropriateTimesplitFromRange(start, end),
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
          <RangePicker
            value={customIntervalDate}
            onChange={setCustomIntervalDate}
          />
          <Button variant="contained" onClick={setCustom} disabled={!goodRange}>
            Apply
          </Button>
        </div>
      </Dialog>
    </>
  );
}
