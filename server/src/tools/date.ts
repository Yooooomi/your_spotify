export const pad = (value: number) => value.toString().padStart(2, "0");

export function dateToDaysMonthsYear(date: Date) {
  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
}

export function dateToMonthsYear(date: Date) {
  return `${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function intervalToDisplay(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 60) {
    return `${dateToDaysMonthsYear(start)} to ${dateToDaysMonthsYear(end)}`;
  }
  return `${dateToMonthsYear(start)} to ${dateToMonthsYear(end)}`;
}
