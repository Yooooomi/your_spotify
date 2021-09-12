import { useEffect, useMemo, useState } from 'react';
import { fillArray, FillModes } from './stats';

export const APICallStatus = {
  PENDING: 'pending',
  FETCHED: 'fetched',
};

export const useAPICall = (call, args, modifier) => {
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(APICallStatus.PENDING);

  useEffect(() => {
    call(...args).then(res => {
      const modified = modifier?.(res.data) || res.data;
      setResponse(modified);
      setStatus(APICallStatus.FETCHED);
    });
  // eslint-disable-next-line
  }, [call, ...args, modifier]);

  return [response, status];
};

export const usePreviousPeriod = (start, end) => useMemo(() => {
  const diff = end.getTime() - start.getTime();

  // Previous end and previous start represent
  // a period of (end - start) days just before the start-end period
  // which gives something like [previousPeriod of n days][period of n days]

  const previousStart = new Date(start.getTime());
  previousStart.setTime(previousStart.getTime() - diff);

  const previousEnd = new Date(end.getTime());
  previousEnd.setTime(previousEnd.getTime() - diff);
  return [
    previousStart,
    previousEnd,
  ];
}, [start, end]);

export const useFilledStats = (stats, start, end, timeSplit, dataGetter, fillMode = FillModes.VOID) => {
  const values = useMemo(
    () => {
      if (!stats) return null;
      return fillArray(stats, start, end, timeSplit, dataGetter, fillMode);
    },
    [stats, start, end, timeSplit, dataGetter, fillMode],
  );

  if (!values) return null;
  if (values.length === 1) {
    values.push(values[0]);
  }
  return values;
};
