import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@material-ui/core';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Artist, Album as AlbumType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import { getImage } from '../../../../services/tools';

interface AlbumProps {
  line?: false;
  artists: Artist[];
  album: AlbumType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

interface HeaderAlbumProps {
  line: true;
}

export default function Album(props: AlbumProps | HeaderAlbumProps) {
  const upmd = useMediaQuery('(min-width: 1150px)');

  if (props.line) {
    return (
      <div className={s.root}>
        <div className={s.albumcover} />
        <div className={clsx(s.name, s.header)}>
          <span className={s.trackname}>Album name / Artist</span>
        </div>
        <span className={clsx(s.sumcount, s.header)}>Count</span>
        <span className={clsx(s.sumduration, s.header)}>Total duration</span>
      </div>
    );
  }

  const { album, artists, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      <img className={s.albumcover} src={getImage(album)} alt="Album cover" />
      <div className={s.name}>
        <span className={s.albumname}>{album.name}</span>
        <span className={s.artistname}>
          {artists.map((art) => (
            <InlineArtist artist={art} key={art.id} />
          ))}
        </span>
      </div>
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
