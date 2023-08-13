import { CircularProgress } from '@mui/material';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import AddToPlaylist from '../../../../components/AddToPlaylist';
import Header from '../../../../components/Header';
import InlineArtist from '../../../../components/InlineArtist';
import InlineTrack from '../../../../components/InlineTrack';
import PlayButton from '../../../../components/PlayButton';
import { DEFAULT_PLAYLIST_NB } from '../../../../components/PlaylistDialog/PlaylistDialog';
import Text from '../../../../components/Text';
import TrackOptions from '../../../../components/TrackOptions';
import { api } from '../../../../services/apis/api';
import { intervalToDisplay } from '../../../../services/date';
import { useAPI } from '../../../../services/hooks/hooks';
import { useOldestListenedAtFromUsers } from '../../../../services/intervals';
import { AdminAccount } from '../../../../services/redux/modules/admin/reducer';
import { selectAccounts } from '../../../../services/redux/modules/admin/selector';
import { PlaylistContext } from '../../../../services/redux/modules/playlist/types';
import { selectUser } from '../../../../services/redux/modules/user/selector';
import { compact } from '../../../../services/tools';
import { CollaborativeMode } from '../../../../services/types';
import { AFFINITY_PREFIX } from '../types';
import s from './index.module.css';

export default function Songs() {
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
    api.collaborativeBestSongs,
    ids,
    start,
    end,
    mode as CollaborativeMode,
  );

  const realIds = useMemo(() => compact([user?._id, ...ids]), [ids, user?._id]);

  const context = useMemo<PlaylistContext>(
    () => ({
      type: 'affinity',
      interval: {
        start: start.getTime(),
        end: end.getTime(),
      },
      nb: DEFAULT_PLAYLIST_NB,
      userIds: realIds,
      mode: mode as CollaborativeMode,
    }),
    [end, mode, realIds, start],
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

  return (
    <div>
      <Header
        title="Affinity by song"
        subtitle={`Affinity computed between ${realIds
          .map(id => accountsDict[id].username)
          .join(', ')} in ${mode} mode, from ${intervalToDisplay(start, end)}`}
        hideInterval
      />
      <div className={s.content}>
        <div className={s.addtoplaylist}>
          <AddToPlaylist context={context} />
        </div>
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
            <div
              key={res.track.id}
              className={clsx('play-button-holder', s.track)}>
              <Text element="strong" className={s.ranking}>
                #{index + 1}
              </Text>
              <PlayButton
                id={res.track.id}
                covers={res.album.images}
                className={s.trackimage}
              />
              <div className={s.trackname}>
                <Text element="div">
                  <InlineTrack track={res.track} />
                </Text>
                <Text className={s.artist}>
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
              <TrackOptions track={res.track} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
