import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@mui/material';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Genre as GenreType } from '../../../../services/types';
import Text from '../../../../components/Text';
import InlineArtist from '../../../../components/InlineArtist';

interface GenreProps {
  line?: false;
  genre: GenreType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

interface HeaderGenreProps {
  line: true;
}

export default function Genre(props: GenreProps | HeaderGenreProps) {
  const upmd = useMediaQuery('(min-width: 1150px)');
  const upmobile = useMediaQuery('(min-width: 600px)');

  if (props.line) {
    return (
      <div className={s.root}>
        <Text className={s.genrename}>Genre name</Text>
        {upmobile && <Text className={clsx(s.genres, s.header)}>Artists</Text>}
        <Text className={clsx(s.sumcount, s.header)}>Count</Text>
        <Text className={clsx(s.sumduration, s.header)}>Total duration</Text>
      </div>
    );
  }

  const { genre, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      <Text className={s.genrename}>{genre.name}</Text>
      {upmobile && (
        <Text className={s.genres}>
          {genre.artists.map((artist, i) => (
            <>
              <InlineArtist artist={artist} />
              {i + 1 < genre.artists.length && ', '}
            </>
          ))}
        </Text>
      )}
      <Text className={s.sumcount}>
        {count.toFixed(1)}{' '}
        {upmd && (
          <Text>({Math.floor((count / totalCount) * 10000) / 100})</Text>
        )}
      </Text>
      <Text className={s.sumduration}>
        {msToMinutesAndSeconds(duration)}{' '}
        {upmd && (
          <Text>({Math.floor((duration / totalDuration) * 10000) / 100})</Text>
        )}
      </Text>
    </div>
  );
}
