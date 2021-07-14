import React from 'react';
import { Link } from 'react-router-dom';
import s from './index.module.css';

function SimpleArtistLine({ artist }) {
  return (
    <Link className={s.root} to={`/artist/${artist.id}`}>
      {artist.name}
    </Link>
  );
}

export default SimpleArtistLine;
