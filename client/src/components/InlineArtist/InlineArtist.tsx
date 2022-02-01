import React from 'react';
import { Link } from 'react-router-dom';
import { Artist } from '../../services/types';
import s from './index.module.css';

interface InlineArtistProps {
  artist: Artist;
}

export default function InlineArtist({ artist }: InlineArtistProps) {
  return (
    <Link to={`/artist/${artist.id}`} className={s.root}>
      {artist.name}
    </Link>
  );
}
