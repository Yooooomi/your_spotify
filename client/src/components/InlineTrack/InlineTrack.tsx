import React from 'react';
import { Link } from 'react-router-dom';
import { Track, TrackWithAlbum } from '../../services/types';
import s from './index.module.css';

interface InlineTrackProps {
  track: Track | TrackWithAlbum;
}

export default function InlineTrack({ track }: InlineTrackProps) {
  return (
    <Link to={`/song/${track.id}`} className={s.root}>
      {track.name}
    </Link>
  );
}
