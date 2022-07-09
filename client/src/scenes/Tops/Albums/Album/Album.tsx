import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@mui/material';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Artist, Album as AlbumType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import { getImage } from '../../../../services/tools';
import Text from '../../../../components/Text';

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
        <div className={clsx(s.name, s.header)}>
          <Text className={s.trackname}>Album name / Artist</Text>
        </div>
        <Text className={clsx(s.sumcount, s.header)}>Count</Text>
        <Text className={clsx(s.sumduration, s.header)}>Total duration</Text>
      </div>
    );
  }

  const { album, artists, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      <img className={s.albumcover} src={getImage(album)} alt="Album cover" />
      <div className={s.name}>
        <Text className={s.albumname}>{album.name}</Text>
        <Text className={s.artistname}>
          {artists.map((art, k, a) => (
            <React.Fragment key={art.id}>
              <InlineArtist artist={art} key={art.id} />
              {k !== a.length - 1 && ', '}
            </React.Fragment>
          ))}
        </Text>
      </div>
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
