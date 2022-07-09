import { useMediaQuery } from '@mui/material';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IntervalDetail } from '../../services/intervals';
import { setDataInterval } from '../../services/redux/modules/user/reducer';
import { selectIntervalDetail } from '../../services/redux/modules/user/selector';
import { intervalDetailToRedux } from '../../services/redux/modules/user/utils';
import { useAppDispatch } from '../../services/redux/tools';
import IntervalSelector from '../IntervalSelector';
import Text from '../Text';
import s from './index.module.css';

interface HeaderProps {
  left?: React.ReactNode;
  title: string;
  subtitle: string;
  hideInterval?: boolean;
}

export default function Header({
  left,
  title,
  subtitle,
  hideInterval,
}: HeaderProps) {
  const dispatch = useAppDispatch();
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
          <Text element="h1">{title}</Text>
          {showSider && <Text>{subtitle}</Text>}
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
