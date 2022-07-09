import React from 'react';
import clsx from 'clsx';
import {
  dateToListenedAt,
  msToMinutesAndSeconds,
} from '../../../services/stats';
import { Album, Artist, Track as TrackType } from '../../../services/types';
import s from './index.module.css';
import InlineArtist from '../../InlineArtist';
import PlayButton from '../../PlayButton';
import Text from '../../Text';

interface TrackProps {
  line?: false;
  listenedAt?: Date;
  track: TrackType;
  artists: Artist[];
  album: Album;
  playable?: boolean;
}

interface HeaderTrackProps {
  line: true;
  playable?: boolean;
}

export default function Track(props: TrackProps | HeaderTrackProps) {
  if (props.line) {
    return (
      <div className={s.root}>
        <div className={clsx(s.name, s.header)}>
          <Text className={s.trackname}>Track name / Artist</Text>
        </div>
        <Text className={clsx(s.albumname, s.header)}>Album name</Text>
        <Text className={clsx(s.duration, s.header)}>Duration</Text>
        <Text className={clsx(s.playedat, s.header)}>Listened at</Text>
      </div>
    );
  }

  const { track, album, artists, listenedAt, playable } = props;

  return (
    <div className={s.root}>
      {playable && <PlayButton className={s.play} id={track.id} />}
      <div className={s.name}>
        <Text className={s.trackname}>{track.name}</Text>
        <Text className={s.artistname}>
          {artists.map((art, k, a) => (
            <React.Fragment key={art.id}>
              <InlineArtist artist={art} />
              {k !== a.length - 1 && ', '}
            </React.Fragment>
          ))}
        </Text>
      </div>
      <Text className={s.albumname}>{album.name}</Text>
      <Text className={s.duration}>
        {msToMinutesAndSeconds(track.duration_ms)}
      </Text>
      {listenedAt && (
        <Text className={s.playedat}>{dateToListenedAt(listenedAt)}</Text>
      )}
    </div>
  );
}
