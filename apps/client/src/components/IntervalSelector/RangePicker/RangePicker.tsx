import { useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  LocalizationProvider,
  DateCalendar,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { MenuItem } from "@mui/material";
import clsx from "clsx";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  subHours,
} from "date-fns";
import s from "./index.module.css";

interface DayProps {
  value: Range;
  date: Date;
  hovering: Date | undefined;
  onHover: (date: Date | undefined) => void;
  onClick: (date: Date) => void;
  outsideCurrentMonth: boolean;
}

export type Range = [Date | undefined, Date | undefined];

function Day({
  date,
  onClick,
  value,
  hovering,
  onHover,
  outsideCurrentMonth,
}: DayProps) {
  const [start, end] = value;

  const hasNoValue = !start && !end;
  const hasBothValue = start && end;
  const isBeingHovered = hovering && hovering.getTime() === date.getTime();
  const isBetweenBothValues =
    hasBothValue &&
    date.getTime() >= start.getTime() &&
    date.getTime() <= end.getTime();
  const isBetweenStartAndHover =
    (start &&
      hovering &&
      start.getTime() <= date.getTime() &&
      date.getTime() <= hovering.getTime()) ||
    (start &&
      hovering &&
      start.getTime() >= date.getTime() &&
      date.getTime() >= hovering.getTime());
  const isStart = start && start.getTime() === date.getTime();
  const isEnd = end && end.getTime() === date.getTime();
  const isBeforeStart = start && start.getTime() > date.getTime();
  const isAfterStart = start && start.getTime() < date.getTime();
  const hoveringIsBeforeStart =
    hovering && start && hovering.getTime() <= start.getTime();
  const hoveringIsAfterStart =
    hovering && start && hovering.getTime() >= start.getTime();

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      onMouseEnter={() => onHover(date)}
      className={clsx("no-button", s.day, {
        [s.outside]: outsideCurrentMonth,
        [s.lonelyHovered]:
          isBeingHovered &&
          (hasNoValue || (hasBothValue && !isBetweenBothValues)),
        [s.hovering]: isBeingHovered,
        [s.between]:
          isBetweenBothValues || (!hasBothValue && isBetweenStartAndHover),
        [s.start]:
          (hasBothValue && isStart) ||
          (!hasBothValue && isBeingHovered && isBeforeStart) ||
          (!hasBothValue && isStart && hoveringIsAfterStart),
        [s.end]:
          (hasBothValue && isEnd) ||
          (!hasBothValue && isBeingHovered && isAfterStart) ||
          (!hasBothValue && isStart && hoveringIsBeforeStart),
      })}>
      {date.getDate()}
    </button>
  );
}

interface DayWrapperAdditionalProps {
  internSetValue: (newValue: Date) => void;
  rangeValue: Range;
  hover: Date;
  setHover: (newHover: Date | undefined) => void;
}

function DayWrapper({
  day,
  internSetValue,
  rangeValue,
  setHover,
  hover,
  outsideCurrentMonth,
}: PickersDayProps & DayWrapperAdditionalProps) {
  return (
    <Day
      key={day.getTime()}
      outsideCurrentMonth={outsideCurrentMonth}
      onClick={internSetValue}
      value={rangeValue}
      onHover={setHover}
      hovering={hover}
      date={day}
    />
  );
}

const presets: Array<{
  label: string;
  create: () => [start: Date, end: Date];
}> = [
    {
      label: "Previous day",
      create: () => {
        const startOfLastDay = startOfDay(subDays(new Date(), 1));
        return [startOfLastDay, endOfDay(startOfLastDay)];
      },
    },
    {
      label: "Previous week",
      create: () => {
        const startOfLastWeek = startOfWeek(subWeeks(new Date(), 1));
        return [startOfLastWeek, endOfWeek(startOfLastWeek)];
      },
    },
    {
      label: "Previous month",
      create: () => {
        const startOfLastMonth = startOfMonth(subMonths(new Date(), 1));
        return [startOfLastMonth, endOfMonth(startOfLastMonth)];
      },
    },
    {
      label: "Previous year",
      create: () => {
        const startOfLastYear = startOfYear(subYears(new Date(), 1));
        return [startOfLastYear, endOfYear(startOfLastYear)];
      },
    },
    {
      label: "Last 24 hours",
      create: () => [subHours(new Date(), 24), new Date()],
    },
    {
      label: "Last 7 days",
      create: () => [subDays(new Date(), 7), new Date()],
    },
    {
      label: "Last month",
      create: () => [subMonths(new Date(), 1), new Date()],
    },
    {
      label: "Last 3 months",
      create: () => [subMonths(new Date(), 3), new Date()],
    },
    {
      label: "Last year",
      create: () => [subYears(new Date(), 1), new Date()],
    },
    {
      label: "Last 2 years",
      create: () => [subYears(new Date(), 2), new Date()],
    },
    {
      label: "Last 10 years",
      create: () => [subYears(new Date(), 10), new Date()],
    },
  ];

interface RangePickerProps {
  value: Range;
  onChange: (newRange: Range) => void;
}

export default function RangePicker({ value, onChange }: RangePickerProps) {
  const [hover, setHover] = useState<Date | undefined>();

  const internSetValue = (date: Date) => {
      const [first, second] = value;
      if (!first) {
        return onChange([date, undefined]);
      }
      if (first && second) {
        return onChange([date, undefined]);
      }
      if (first.getTime() < date.getTime()) {
        return onChange([first, date]);
      }
      return onChange([date, first]);
    };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={s.panel}>
        <div className={s.presets}>
          {presets.map(preset => (
            <MenuItem
              key={preset.label}
              onClick={() => onChange(preset.create())}>
              {preset.label}
            </MenuItem>
          ))}
        </div>
        <DateCalendar
          classes={{ root: s.calendarRoot }}
          value={null}
          slots={{
            day: DayWrapper as any,
          }}
          slotProps={{
            day: {
              hover,
              internSetValue,
              setHover,
              rangeValue: value,
            } as any,
          }}
        />
      </div>
    </LocalizationProvider>
  );
}
