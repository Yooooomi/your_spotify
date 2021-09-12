const pad = nb => nb.toString().padStart(2, '0');

export const duration = (ms) => {
  let seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);

  seconds -= minutes * 60;
  seconds = Math.floor(seconds);
  return `${pad(minutes)}:${pad(seconds)}`;
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const formatDate = (date, withHour = false) => {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  let current = `${pad(day)}/${pad(month + 1)}/${year}`;
  if (withHour) {
    const hours = date.getHours();
    current += ` - ${pad(hours)}:00`;
  }
  return current;
};

export const formatHour = (date, dateIfMoreThanOneDay = false) => {
  const now = new Date();
  const base = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const diff = Math.abs(now.getTime() - date.getTime());
  const moreThanADay = diff > (1000 * 60 * 60 * 24);

  if (!dateIfMoreThanOneDay || !moreThanADay) {
    return base;
  }
  return `${formatDate(date, false)} ${base}`;
};

export const formatDateFromYearDecimal = year => {
  const soloYear = Math.floor(year);
  let month = year - soloYear;
  month = Math.floor(month * 1.2 * 10);
  return `${months[month]} ${soloYear}`;
};

export function dateObjToString(dateObj) {
  return `${dateObj.year}/${dateObj.month}`;
}

export function dateObjToMonthStringAndYear(dateObj) {
  return `${months[dateObj.month]} ${dateObj.year}`;
}
