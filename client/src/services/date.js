
const pad = nb => nb.toString().padStart(2, '0');

export const duration = (ms) => {
  let seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);

  seconds -= minutes * 60;
  seconds = Math.floor(seconds);
  return `${pad(minutes)}:${pad(seconds)}`;
}

export const formatHour = date => {
  return `${pad(date.getHours())}h${pad(date.getMinutes())}`;
}

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

export const formatDate = date => {
  const month = date.getMonth();
  const day = date.getDay();
  const year = date.getFullYear();

  return `${pad(day)}/${pad(month)}/${year}`;
}

export const formatDateFromYearDecimal = year => {
  const soloYear = Math.floor(year);
  let month = year - soloYear;
  month = Math.floor(month * 1.2 * 10);
  return `${months[month]} ${soloYear}`;
}
