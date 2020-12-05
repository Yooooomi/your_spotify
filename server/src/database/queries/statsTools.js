
const getGroupingByTimeSplit = (timeSplit, prefix = '') => {
  if (prefix !== '') prefix = `${prefix}.`;
  if (timeSplit === 'all') return null;
  if (timeSplit === 'year') return { year: `$${prefix}year` };
  if (timeSplit === 'week') return { year: `$${prefix}year`, week: `$${prefix}week` };
  if (timeSplit === 'month') return { year: `$${prefix}year`, month: `$${prefix}month` };
  if (timeSplit === 'day') return { year: `$${prefix}year`, month: `$${prefix}month`, day: `$${prefix}day` };
  if (timeSplit === 'hour') return { year: `$${prefix}year`, month: `$${prefix}month`, day: `$${prefix}day`, hour: `$${prefix}hour` };
  return {};
}

const sortByTimeSplit = (timeSplit, prefix = '') => {
  if (prefix !== '') prefix = `${prefix}.`;
  if (timeSplit === 'all') return [];
  if (timeSplit === 'year') return [{ $sort: { [`${prefix}year`]: 1 } }];
  if (timeSplit === 'week') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}week`]: 1 } }];
  if (timeSplit === 'month') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1 } }];
  if (timeSplit === 'day') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1, [`${prefix}day`]: 1 } }];
  if (timeSplit === 'hour') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1, [`${prefix}day`]: 1, [`${prefix}hour`]: 1 } }];
  return [];
}

const getGroupByDateProjection = () => ({
  year: { "$year": { date: "$played_at", timezone: "Europe/Paris" } },
  month: { "$month": { date: "$played_at", timezone: "Europe/Paris" } },
  day: { "$dayOfMonth": { date: "$played_at", timezone: "Europe/Paris" } },
  week: { "$week": { date: "$played_at", timezone: "Europe/Paris" } },
  hour: { "$hour": { date: "$played_at", timezone: "Europe/Paris" } },
});

module.exports = {
  getGroupingByTimeSplit,
  sortByTimeSplit,
  getGroupByDateProjection,
};
