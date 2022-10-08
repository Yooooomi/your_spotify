import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@mui/material';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Artist, Album, Track as TrackType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import Text from '../../../../components/Text';
import PlayButton from '../../../../components/PlayButton';
import TrackOptions from '../../../../components/TrackOptions';

interface TrackProps {
  line?: false;
  track: TrackType;
  artists: Artist[];
  album: Album;
  playable?: boolean;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

interface HeaderTrackProps {
  line: true;
  playable?: boolean;
}

export default function Track(props: TrackProps | HeaderTrackProps) {
  const upmd = useMediaQuery('(min-width: 1150px)');

  if (props.line) {
    return (
      <div className={s.root}>
        <div className={clsx(s.name, s.header)}>
          <Text className={s.trackname}>Track name / Artist</Text>
        </div>
        {upmd && (
          <Text className={clsx(s.albumname, s.header)}>Album name</Text>
        )}
        {upmd && <Text className={clsx(s.duration, s.header)}>Duration</Text>}
        <Text className={clsx(s.sumcount, s.header)}>Count</Text>
        <Text className={clsx(s.sumduration, s.header)}>Total duration</Text>
        <div className={s.trackoptions} />
      </div>
    );
  }

  const {
    track,
    album,
    artists,
    playable,
    duration,
    totalDuration,
    count,
    totalCount,
  } = props;
  return (
    <div className={s.root}>
      {playable && (
        <PlayButton
          id={track.id}
          covers={album.images}
          className={s.albumcover}
        />
      )}
      <div className={s.name}>
        <Text className={s.trackname}>{track.name}</Text>
        <Text className={s.artistname}>
          {artists.map(art => (
            <React.Fragment key={art.id}>
              <InlineArtist key={art.id} artist={art} />{' '}
            </React.Fragment>
          ))}
        </Text>
      </div>
      {upmd && <Text className={s.albumname}>{album.name}</Text>}
      {upmd && (
        <Text className={s.duration}>
          {msToMinutesAndSeconds(track.duration_ms)}
        </Text>
      )}
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
      <TrackOptions track={track} />
    </div>
  );
}
