export function getFirstListenedAt(date: Date) {
  date.setDate(date.getDate() - 1);
  return date;
}
