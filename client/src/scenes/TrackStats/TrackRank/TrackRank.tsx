import { CircularProgress } from '@mui/material';
import clsx from 'clsx';
import { useEffect, useCallback, useState, useMemo } from 'react';
import InlineTrack from '../../../components/InlineTrack';
import Text from '../../../components/Text';
import { api } from '../../../services/apis/api';
import { useAPI } from '../../../services/hooks';
import { Track } from '../../../services/types';
import s from './index.module.css';

interface TrackRankProps {
  trackId: string;
}

export default function TrackRank({ trackId }: TrackRankProps) {
  const [tracks, setTracks] = useState<Record<string, Track>>({});
  const trackRank = useAPI(api.getTrackRank, trackId);

  const ids = useMemo(
    () => trackRank?.results.map(r => r.id) ?? [],
    [trackRank?.results],
  );

  useEffect(() => {
    async function fetchTracks() {
      if (!ids.every(id => id in tracks)) {
        try {
          const { data } = await api.getTrackDetails(ids);
          setTracks(
            data.reduce<Record<string, Track>>((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchTracks();
  }, [tracks, ids]);

  const getTrack = useCallback((id: string) => tracks[id], [tracks]);

  if (!trackRank || !ids.every(id => id in tracks)) {
    return (
      <div className={s.loading}>
        <CircularProgress size={24} />
        <Text>Song rank is loading</Text>
      </div>
    );
  }

  return (
    <div className={s.ranks}>
      {trackRank.results.map((rank, k, a) => (
        <div
          key={rank.id}
          className={clsx(s.rank, {
            [s.before]:
              !trackRank.isMax &&
              ((trackRank.isMin && k < 2) || (!trackRank.isMin && k === 0)),
            [s.after]:
              !trackRank.isMin &&
              ((trackRank.isMax && k > 0) || (!trackRank.isMax && k === 2)),
            [s.actual]:
              (trackRank.isMax && k === 0) ||
              (trackRank.isMin && k === a.length - 1) ||
              (!trackRank.isMax && !trackRank.isMin && k === 1),
          })}>
          #
          {trackRank.index +
            k +
            (trackRank.isMax ? 1 : 0) +
            (trackRank.isMin ? -1 : 0)}{' '}
          <InlineTrack track={getTrack(rank.id)!} />
        </div>
      ))}
    </div>
  );
}
