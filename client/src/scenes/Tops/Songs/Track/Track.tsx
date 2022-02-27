import React, { useCallback } from 'react';
import clsx from 'clsx';
import { IconButton, useMediaQuery } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import s from './index.module.css';
import { api } from '../../../../services/api';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Artist, Album, Track as TrackType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import { getImage } from '../../../../services/tools';

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
  const trackId = props.line ? null : props.track.id;
  const play = useCallback(async () => {
    if (!trackId) return;
    try {
      await api.play(trackId);
    } catch (e) {
      console.error(e);
    }
  }, [trackId]);

  const upmd = useMediaQuery('(min-width: 1150px)');

  if (props.line) {
    return (
      <div className={s.root}>
        <div className={clsx(s.name, s.header)}>
          <span className={s.trackname}>Track name / Artist</span>
        </div>
        {upmd && <span className={clsx(s.albumname, s.header)}>Album name</span>}
        {upmd && <span className={clsx(s.duration, s.header)}>Duration</span>}
        <span className={clsx(s.sumcount, s.header)}>Count</span>
        <span className={clsx(s.sumduration, s.header)}>Total duration</span>
      </div>
    );
  }

  const { track, album, artists, playable, duration, totalDuration, count, totalCount } = props;
  return (
    <div className={s.root}>
      {playable && (
        <IconButton className={s.play} size="small" onClick={play}>
          <PlayArrow />
        </IconButton>
      )}
      <img className={s.albumcover} src={getImage(album)} alt="Album cover" />
      <div className={s.name}>
        <span className={s.trackname}>{track.name}</span>
        <span className={s.artistname}>
          {artists.map((art) => (
            <React.Fragment key={art.id}>
              <InlineArtist key={art.id} artist={art} />{' '}
            </React.Fragment>
          ))}
        </span>
      </div>
      {upmd && <span className={s.albumname}>{album.name}</span>}
      {upmd && <span className={s.duration}>{msToMinutesAndSeconds(track.duration_ms)}</span>}
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
