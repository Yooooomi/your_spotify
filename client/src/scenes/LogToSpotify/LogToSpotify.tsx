import React from 'react';
import FullscreenCentered from '../../components/FullscreenCentered';
import { getSpotifyLogUrl } from '../../services/tools';
import s from './index.module.css';

export default function LogToSpotify() {
  return (
    <FullscreenCentered>
      <div className={s.disclaimer}>You need to log in to Spotify to use this application</div>
      <div className={s.sub}>
        This application reads your recent played songs and asks for permission to play a specific
        song to your current session. It might take a few minutes before first stats are available.
      </div>
      <a href={getSpotifyLogUrl()}>Log to Spotify</a>
    </FullscreenCentered>
  );
}
