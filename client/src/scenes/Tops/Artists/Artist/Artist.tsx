import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@mui/material';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Artist as ArtistType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import { getImage } from '../../../../services/tools';
import Text from '../../../../components/Text';

interface ArtistProps {
  line?: false;
  artist: ArtistType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

interface HeaderArtistProps {
  line: true;
}

export default function Artist(props: ArtistProps | HeaderArtistProps) {
  const upmd = useMediaQuery('(min-width: 1150px)');
  const upmobile = useMediaQuery('(min-width: 600px)');

  if (props.line) {
    return (
      <div className={s.root}>
        <Text className={s.artistname}>Artist name</Text>
        {upmobile && <Text className={clsx(s.genres, s.header)}>Genres</Text>}
        <Text className={clsx(s.sumcount, s.header)}>Count</Text>
        <Text className={clsx(s.sumduration, s.header)}>Total duration</Text>
      </div>
    );
  }

  const { artist, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      <img
        className={s.artistcover}
        src={getImage(artist)}
        alt="Artist cover"
      />
      <Text className={s.artistname}>
        <InlineArtist artist={artist} />
      </Text>
      {upmobile && <Text className={s.genres}>{artist.genres.join(', ')}</Text>}
      <Text className={s.sumcount}>
        {count}{' '}
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
