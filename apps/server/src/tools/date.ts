export const pad = (value: number) => value.toString().padStart(2, "0");

function getIntlDateFormat(format: string) {
  if (format === "default") {
    return undefined;
  }
  return format;
}

export const DateFormatter = {
  toMonthYear(format: string, date: Date) {
    return new Intl.DateTimeFormat(getIntlDateFormat(format), {
      month: "2-digit",
      year: "numeric",
    }).format(date);
  },
  toDayMonthYear(format: string, date: Date) {
    return new Intl.DateTimeFormat(getIntlDateFormat(format), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  },
};

export function intervalToDisplay(format: string, start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 60) {
    return `${DateFormatter.toDayMonthYear(format, start)} to ${DateFormatter.toDayMonthYear(format, end)}`;
  }
  return `${DateFormatter.toMonthYear(format, start)} to ${DateFormatter.toMonthYear(format, end)}`;
}
