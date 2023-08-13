import { CircularProgress } from '@mui/material';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../../../../components/Header';
import IdealImage from '../../../../components/IdealImage';
import InlineArtist from '../../../../components/InlineArtist';
import Text from '../../../../components/Text';
import { api } from '../../../../services/apis/api';
import { intervalToDisplay } from '../../../../services/date';
import { useAPI } from '../../../../services/hooks/hooks';
import { useOldestListenedAtFromUsers } from '../../../../services/intervals';
import { AdminAccount } from '../../../../services/redux/modules/admin/reducer';
import { selectAccounts } from '../../../../services/redux/modules/admin/selector';
import { selectUser } from '../../../../services/redux/modules/user/selector';
import { CollaborativeMode } from '../../../../services/types';
import { AFFINITY_PREFIX } from '../types';
import s from './index.module.css';

export default function Artists() {
  const user = useSelector(selectUser);
  const accounts = useSelector(selectAccounts);
  const { mode } = useParams();
  const [query] = useSearchParams();

  const idsQuery = query.get('ids');

  const ids = useMemo(() => idsQuery?.split(',') ?? [], [idsQuery]);
  const {
    interval: { start, end },
  } = useOldestListenedAtFromUsers(ids, AFFINITY_PREFIX);

  const result = useAPI(
    api.collaborativeBestArtists,
    ids,
    start,
    end,
    mode as CollaborativeMode,
  );

  if (!result || !user) {
    return (
      <div className={s.loading}>
        <CircularProgress size={18} />
        <Text element="div">Loading your data</Text>
      </div>
    );
  }

  const accountsDict = accounts.reduce<Record<string, AdminAccount>>(
    (acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    },
    {},
  );
  const realIds = [user._id, ...ids];

  return (
    <div>
      <Header
        title="Affinity by artist"
        subtitle={`Affinity computed between ${realIds
          .map(id => accountsDict[id].username)
          .join(', ')} in ${mode} mode, from ${intervalToDisplay(start, end)}`}
        hideInterval
      />
      <div className={s.content}>
        {result?.map((res, index) => {
          const listened = realIds.map(id => res[id]);

          let maxIndex = 0;
          let max = 0;
          for (let i = 0; i < listened.length; i += 1) {
            if (listened[i] > max) {
              maxIndex = i;
              max = listened[i];
            }
          }

          return (
            <div key={res.artist.id} className={s.artist}>
              <Text element="strong" className={s.ranking}>
                #{index + 1}
              </Text>
              <IdealImage
                alt="cover"
                images={res.artist.images}
                size={48}
                className={s.artistimage}
              />
              <div className={s.artistname}>
                <Text element="div">
                  <InlineArtist artist={res.artist} />
                </Text>
              </div>
              <div className={s.enjoyed}>
                <Text>
                  Most enjoyed by{' '}
                  <Text element="strong">
                    {accountsDict[realIds[maxIndex]].username}
                  </Text>
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
