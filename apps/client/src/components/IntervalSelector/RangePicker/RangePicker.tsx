import { useCallback, useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  LocalizationProvider,
  DateCalendar,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { MenuItem } from "@mui/material";
import clsx from "clsx";
import { fresh } from "../../../services/stats";
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
}: PickersDayProps<Date> & DayWrapperAdditionalProps) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const presets = [
  {
    label: "Last week",
    create: () => {
      const date = fresh(new Date(), true);
      date.setDate(date.getDate() - 7);
      return date;
    },
  },
  {
    label: "Last month",
    create: () => {
      const date = fresh(new Date(), true);
      date.setMonth(date.getMonth() - 1);
      return date;
    },
  },
  {
    label: "Last 3 months",
    create: () => {
      const date = fresh(new Date(), true);
      date.setMonth(date.getMonth() - 3);
      return date;
    },
  },
  {
    label: "Last year",
    create: () => {
      const date = fresh(new Date(), true);
      date.setFullYear(date.getFullYear() - 1);
      return date;
    },
  },
  {
    label: "Last 2 years",
    create: () => {
      const date = fresh(new Date(), true);
      date.setFullYear(date.getFullYear() - 2);
      return date;
    },
  },
  {
    label: "Last 10 years",
    create: () => {
      const date = fresh(new Date(), true);
      date.setFullYear(date.getFullYear() - 10);
      return date;
    },
  },
  {
    label: "This year",
    create: () => {
      const date = fresh(new Date(), true);
      date.setMonth(0);
      date.setDate(1);
      return date;
    },
  },
];

interface RangePickerProps {
  value: Range;
  onChange: (newRange: Range) => void;
}

export default function RangePicker({ value, onChange }: RangePickerProps) {
  const [hover, setHover] = useState<Date | undefined>();

  const internSetValue = useCallback(
    (date: Date) => {
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
    },
    [onChange, value],
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={s.panel}>
        <div className={s.presets}>
          {presets.map(preset => (
            <MenuItem
              key={preset.label}
              onClick={() =>
                onChange([preset.create(), fresh(new Date(), true)])
              }>
              {preset.label}
            </MenuItem>
          ))}
        </div>
        <DateCalendar
          classes={{ root: s.calendarRoot }}
          value={null}
          onChange={() => {}}
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
