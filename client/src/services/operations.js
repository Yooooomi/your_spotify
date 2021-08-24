export const ratioValueAB = (oldValue, newValue) => {
  if (oldValue === newValue) return 0;
  if (oldValue === 0) return 100;
  if (newValue === 0) return -100;

  if (oldValue > newValue) {
    const diff = oldValue - newValue;
    return -(diff / oldValue) * 100;
  } if (oldValue < newValue) {
    const diff = newValue - oldValue;
    return (diff / newValue) * 100;
  }
  return 0;
};

export const msToHoursAndMinutesString = (ms) => {
  const hour = 1000 * 60 * 60;
  const hours = Math.floor(ms / hour);
  const minutes = Math.floor((ms - (hours * hour)) / 1000 / 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export default {
  ratioValueAB,
};
