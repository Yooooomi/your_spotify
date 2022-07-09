import { Button, Checkbox, MenuItem, Select, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { HelpOutline } from '@mui/icons-material';
import s from './index.module.css';
import { AdminAccount } from '../../../services/redux/modules/admin/reducer';
import { selectAccounts } from '../../../services/redux/modules/admin/selector';
import { CollaborativeMode } from '../../../services/types';
import { selectUser } from '../../../services/redux/modules/user/selector';
import IntervalSelector from '../../../components/IntervalSelector';
import Text from '../../../components/Text';
import {
  detailIntervalToQuery,
  IntervalDetail,
  presetIntervals,
} from '../../../services/intervals';
import { useNavigateAndSearch } from '../../../services/hooks';
import { AFFINITY_PREFIX } from './types';

export default function Affinity() {
  const navigate = useNavigateAndSearch();
  const user = useSelector(selectUser);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState(CollaborativeMode.MINIMA);
  const [statType, setStatType] = useState('songs');
  const [dataInterval, setDataInterval] = useState<IntervalDetail>(
    presetIntervals[1],
  );
  const accounts = useSelector(selectAccounts);

  const add = useCallback(
    (account: AdminAccount) => {
      const newSet = new Set(ids);
      if (newSet.has(account.id)) {
        newSet.delete(account.id);
      } else {
        newSet.add(account.id);
      }
      setIds(newSet);
    },
    [ids],
  );

  const compute = useCallback(() => {
    navigate(`/collaborative/top/${statType}/${mode}`, {
      ids: Array.from(ids).join(','),
      ...detailIntervalToQuery(dataInterval, AFFINITY_PREFIX),
    });
  }, [navigate, statType, mode, ids, dataInterval]);

  return (
    <div className={s.root}>
      <div>
        <Text element="h1" className={s.title}>
          Affinity{' '}
          <Tooltip
            title={
              <div>
                <p>
                  The affinity represents the probability the user like the same
                  songs. The affinity feature comes with two{' '}
                  <strong>modes</strong>:
                </p>
                <ul>
                  <li>
                    <strong>Average</strong>: bases the ranking on the average
                    of the proportion each people listening to a specific
                    element. If A listens to a song 50% of his time, B 25% and C
                    0%, the average will be 25%, thus ranking higher than A 12%,
                    B 12% and C 12%.
                  </li>
                  <li>
                    <strong>Minima</strong>: bases the ranking on the minimal
                    proportion of each people listening to a specific element.
                    If A listens to a song 50% of his time, B 25% and C 0%, the
                    minima will be 0%, thus ranking lower than A 100% B 5% and C
                    1%.
                  </li>
                </ul>
                <p>
                  Average can mean that the top songs will satisfy a lot some
                  people while minima means that the top songs will be known by
                  everyone but not enjoyed as much for everyone.
                </p>
              </div>
            }>
            <HelpOutline className={s.question} />
          </Tooltip>
        </Text>
        <div className={s.accountselection}>
          <Text element="h2" className={s.section}>
            Users
          </Text>
          {accounts.map(account => (
            <button
              type="button"
              key={account.id}
              className={s.account}
              onClick={() => add(account)}>
              <Text>{account.username}</Text>
              <Checkbox
                checked={ids.has(account.id) || account.id === user?._id}
                disabled={account.id === user?._id}
                disableRipple
                disableTouchRipple
                disableFocusRipple
              />
            </button>
          ))}
        </div>
        <div className={s.modeselection}>
          <Text element="h2" className={s.section}>
            Mode
          </Text>
          <Select
            variant="standard"
            value={mode}
            onChange={ev => setMode(ev.target.value as CollaborativeMode)}>
            <MenuItem value={CollaborativeMode.MINIMA}>Minima</MenuItem>
            <MenuItem value={CollaborativeMode.AVERAGE}>Average</MenuItem>
          </Select>
        </div>
        <div className={s.typeselection}>
          <Text element="h2" className={s.section}>
            Type
          </Text>
          <Select
            variant="standard"
            value={statType}
            onChange={ev => setStatType(ev.target.value)}>
            <MenuItem value="songs">Songs</MenuItem>
            <MenuItem value="albums">Albums</MenuItem>
            <MenuItem value="artists">Artists</MenuItem>
          </Select>
        </div>
        <div className={s.timeselection}>
          <Text element="h2" className={s.section}>
            Interval
          </Text>
          <IntervalSelector
            forceTiny
            value={dataInterval}
            onChange={setDataInterval}
            selectType="standard"
          />
        </div>
        <Button onClick={compute} variant="contained" disabled={ids.size === 0}>
          Calculate affinity
        </Button>
      </div>
    </div>
  );
}
