import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@mui/material';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Artist as ArtistType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import { getImage } from '../../../../services/tools';

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
        <span className={s.artistname}>Artist name</span>
        {upmobile && <span className={clsx(s.genres, s.header)}>Genres</span>}
        <span className={clsx(s.sumcount, s.header)}>Count</span>
        <span className={clsx(s.sumduration, s.header)}>Total duration</span>
      </div>
    );
  }

  const { artist, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      <img className={s.artistcover} src={getImage(artist)} alt="Artist cover" />
      <span className={s.artistname}>
        <InlineArtist artist={artist} />
      </span>
      {upmobile && <span className={s.genres}>{artist.genres.join(', ')}</span>}
      <span className={s.sumcount}>
        {count} {upmd && <span>({Math.floor((count / totalCount) * 10000) / 100})</span>}
      </span>
      <span className={s.sumduration}>
        {msToMinutesAndSeconds(duration)}{' '}
        {upmd && <span>({Math.floor((duration / totalDuration) * 10000) / 100})</span>}
      </span>
    </div>
  );
}
