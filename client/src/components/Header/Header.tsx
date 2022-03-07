import { useMediaQuery } from '@mui/material';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { intervalDetailToRedux } from '../../services/date';
import { setDataInterval } from '../../services/redux/modules/user/reducer';
import { selectIntervalDetail } from '../../services/redux/modules/user/selector';
import IntervalSelector from '../IntervalSelector';
import { IntervalDetail } from '../IntervalSelector/IntervalSelector';
import s from './index.module.css';

interface HeaderProps {
  left?: React.ReactNode;
  title: string;
  subtitle: string;
  hideInterval?: boolean;
}

export default function Header({ left, title, subtitle, hideInterval }: HeaderProps) {
  const dispatch = useDispatch();
  const intervalDetail = useSelector(selectIntervalDetail);
  const showSider = !useMediaQuery('(max-width: 900px)');

  const changeInterval = useCallback(
    (newInterval: IntervalDetail) => {
      dispatch(setDataInterval(intervalDetailToRedux(newInterval)));
    },
    [dispatch],
  );

  return (
    <div className={s.root}>
      <div className={s.left}>
        {left}
        <div className={s.texts}>
          <h1>{title}</h1>
          {showSider && <span>{subtitle}</span>}
        </div>
      </div>
      {!hideInterval && (
        <div>
          <IntervalSelector value={intervalDetail} onChange={changeInterval} />
        </div>
      )}
    </div>
  );
}
