import {
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  useMediaQuery,
} from "@material-ui/core";
import React from "react";
import { Interval, Timesplit } from "../../services/types";

interface IntervalSelectorProps {
  value: string;
  onChange: (newIndex: string) => void;
}

const lastDay = new Date();
lastDay.setDate(lastDay.getDate() - 1);
const lastWeek = new Date();
lastWeek.setDate(lastDay.getDate() - 7);
const lastMonth = new Date();
lastMonth.setMonth(lastDay.getMonth() - 1);
const lastYear = new Date();
lastYear.setFullYear(lastDay.getFullYear() - 1);
const now = new Date();

export const intervals: { name: string; interval: Interval }[] = [
  {
    name: "Last day",
    interval: { timesplit: Timesplit.hour, start: lastDay, end: now },
  },
  {
    name: "Last week",
    interval: { timesplit: Timesplit.day, start: lastWeek, end: now },
  },
  {
    name: "Last month",
    interval: { timesplit: Timesplit.day, start: lastMonth, end: now },
  },
  {
    name: "Last year",
    interval: { timesplit: Timesplit.month, start: lastYear, end: now },
  },
];

export default function IntervalSelector({
  value,
  onChange,
}: IntervalSelectorProps) {
  const upmd = !useMediaQuery("(max-width: 1250px)");

  if (!upmd) {
    return (
      <Select
        value={value}
        onChange={(ev) => onChange(ev.target.value as string)}
      >
        {intervals.map((inter, index) => (
          <MenuItem key={inter.name} value={index.toString()}>
            {inter.name}
          </MenuItem>
        ))}{" "}
      </Select>
    );
  }

  return (
    <RadioGroup
      row
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
      name="interval radio group"
    >
      {intervals.map((inter, index) => (
        <FormControlLabel
          key={inter.name}
          value={index.toString()}
          control={<Radio />}
          label={inter.name}
        />
      ))}
    </RadioGroup>
  );
}
