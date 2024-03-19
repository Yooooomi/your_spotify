import { Timesplit } from "./types";

export function cloneDate(date: Date) {
  return new Date(date.getTime());
}

export function getAppropriateTimesplitFromRange(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days <= 2) {
    return Timesplit.hour;
  }
  if (days <= 60) {
    return Timesplit.day;
  }
  if (days <= 800) {
    return Timesplit.month;
  }
  return Timesplit.year;
}

export const DateFormatter = {
  fromNumberToHour(hour: number) {
    const d = new Date();
    d.setHours(hour);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
    }).format(d);
  },
  toMonthStringYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  },
  toHour(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
    }).format(date);
  },
  toYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
    }).format(date);
  },
  toDaysMonth(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  },
  toMonthsYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      year: "numeric",
    }).format(date);
  },
  toDaysMonthsYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  },
  toHourDaysMonthsYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  },
  toMinuteHourDaysMonthsYear(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  },
  toMonthString(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date);
  },
  listenedAt(date: Date) {
    const now = new Date();
    const day = 1000 * 60 * 60 * 24;
    const diff = now.getTime() - date.getTime();
    if (diff < day) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  },
};

export function intervalToDisplay(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 60) {
    return `${DateFormatter.toDaysMonthsYear(start)} to ${DateFormatter.toDaysMonthsYear(end)}`;
  }
  return `${DateFormatter.toMonthsYear(start)} to ${DateFormatter.toMonthsYear(end)}`;
}

export function intervalToHoursAndMinutes(start: Date, end: Date) {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  let diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / hour);
  diff -= hours * hour;
  const minutes = Math.floor(diff / minute);
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  return `${hours} hours and ${minutes} minutes`;
}

export function intervalToKey(start: Date, end: Date) {
  return `${start.getTime()}-${end.getTime()}`;
}
