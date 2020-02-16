
export const setThisToMorning = date => {
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);
  return date;
};

export const setThisToEvening = date => {
  date.setSeconds(59);
  date.setMinutes(59);
  date.setHours(23);
  return date;
};

export const today = () => {
  const start = setThisToMorning(new Date());
  const end = setThisToEvening(new Date());

  return {
    start,
    end,
  };
};

export const lastDay = () => {
  const start = setThisToMorning(new Date());

  start.setDate(start.getDate() - 1);
  const end = setThisToEvening(new Date());

  return {
    start,
    end,
  };
};

export const lastWeek = () => {
  const start = setThisToMorning(new Date());

  start.setDate(start.getDate() - 7);
  const end = setThisToMorning(new Date());

  return {
    start,
    end,
  };
};

export const lastMonth = () => {
  const start = setThisToMorning(new Date());

  start.setMonth(start.getMonth() - 1);
  const end = setThisToEvening(new Date());

  return {
    start,
    end,
  };
};

export const lastYear = () => {
  const start = setThisToMorning(new Date());

  start.setFullYear(start.getFullYear() - 1);
  const end = setThisToEvening(new Date());

  return {
    start,
    end,
  };
};
