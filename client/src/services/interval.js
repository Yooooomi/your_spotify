
export const lastDay = () => {
  const start = new Date();

  start.setDate(start.getDate() - 1);
  const end = new Date();

  return {
    start,
    end,
  };
}

export const lastWeek = () => {
  const start = new Date();

  start.setDate(start.getDate() - 7);
  const end = new Date();

  return {
    start,
    end,
  };
}

export const lastMonth = () => {
  const start = new Date();

  start.setMonth(start.getMonth() - 1);
  const end = new Date();

  return {
    start,
    end,
  };
}

export const lastYear = () => {
  const start = new Date();

  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();

  return {
    start,
    end,
  };
}
