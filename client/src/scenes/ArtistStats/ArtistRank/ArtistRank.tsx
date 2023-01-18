import { CircularProgress } from '@mui/material';
import clsx from 'clsx';
import { useEffect, useCallback, useState, useMemo } from 'react';
import InlineArtist from '../../../components/InlineArtist';
import Text from '../../../components/Text';
import { api } from '../../../services/apis/api';
import { useAPI } from '../../../services/hooks';
import { Artist } from '../../../services/types';
import s from './index.module.css';

interface ArtistRankProps {
  artistId: string;
}

export default function ArtistRank({ artistId }: ArtistRankProps) {
  const [artists, setArtists] = useState<Record<string, Artist>>({});
  const artistRank = useAPI(api.getArtistRank, artistId);

  const ids = useMemo(
    () => artistRank?.results.map(r => r.id) ?? [],
    [artistRank?.results],
  );

  useEffect(() => {
    async function fetchArtists() {
      if (!ids.every(id => id in artists)) {
        try {
          const { data } = await api.getArtists(ids);
          setArtists(
            data.reduce<Record<string, Artist>>((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchArtists();
  }, [artists, ids]);

  const getArtist = useCallback((id: string) => artists[id], [artists]);

  if (!artistRank || !ids.every(id => id in artists)) {
    return (
      <div className={s.loading}>
        <CircularProgress size={24} />
        <Text>Artist rank is loading</Text>
      </div>
    );
  }

  return (
    <div className={s.ranks}>
      {artistRank.results.map((rank, k, a) => (
        <div
          key={rank.id}
          className={clsx(s.rank, {
            [s.before]:
              !artistRank.isMax &&
              ((artistRank.isMin && k < 2) || (!artistRank.isMin && k === 0)),
            [s.after]:
              !artistRank.isMin &&
              ((artistRank.isMax && k > 0) || (!artistRank.isMax && k === 2)),
            [s.actual]:
              (artistRank.isMax && k === 0) ||
              (artistRank.isMin && k === a.length - 1) ||
              (!artistRank.isMax && !artistRank.isMin && k === 1),
          })}>
          #
          {artistRank.index +
            k +
            (artistRank.isMax ? 1 : 0) +
            (artistRank.isMin ? -1 : 0)}{' '}
          <InlineArtist artist={getArtist(rank.id)!} />
        </div>
      ))}
    </div>
  );
}
