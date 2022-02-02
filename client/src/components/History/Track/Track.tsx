import React, { useCallback } from 'react';
import clsx from 'clsx';
import { IconButton } from '@mui/material';
import { PlayArrow } from '@material-ui/icons';
import { dateToListenedAt, msToMinutesAndSeconds } from '../../../services/stats';
import { Album, Artist, Track as TrackType } from '../../../services/types';
import s from './index.module.css';
import { api } from '../../../services/api';
import InlineArtist from '../../InlineArtist';

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
  const trackId = props.line ? null : props.track.id;
  const play = useCallback(async () => {
    if (!trackId) return;
    try {
      await api.play(trackId);
    } catch (e) {
      console.error(e);
    }
  }, [trackId]);

  if (props.line) {
    return (
      <div className={s.root}>
        <div className={clsx(s.name, s.header)}>
          <span className={s.trackname}>Track name / Artist</span>
        </div>
        <span className={clsx(s.albumname, s.header)}>Album name</span>
        <span className={clsx(s.duration, s.header)}>Duration</span>
        <span className={clsx(s.playedat, s.header)}>Listened at</span>
      </div>
    );
  }

  const { track, album, artists, listenedAt, playable } = props;

  return (
    <div className={s.root}>
      {playable && (
        <IconButton className={s.play} size="small" onClick={play}>
          <PlayArrow />
        </IconButton>
      )}
      <div className={s.name}>
        <span className={s.trackname}>{track.name}</span>
        <span className={s.artistname}>
          {artists.map((art) => (
            <InlineArtist key={art.id} artist={art} />
          ))}
        </span>
      </div>
      <span className={s.albumname}>{album.name}</span>
      <span className={s.duration}>{msToMinutesAndSeconds(track.duration_ms)}</span>
      {listenedAt && <span className={s.playedat}>{dateToListenedAt(listenedAt)}</span>}
    </div>
  );
}
