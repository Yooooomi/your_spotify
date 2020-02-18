

export const ratioValueAB = (oldValue, newValue) => {
  if (oldValue === 0) return 100;
  const diff = newValue / oldValue;

  if (diff > 1) {
    return (diff - 1) * 100;
  } else {
    return -diff * 100;
  }
};
