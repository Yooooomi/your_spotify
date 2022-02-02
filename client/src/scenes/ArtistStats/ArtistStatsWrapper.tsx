import { CircularProgress } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import ArtistStats from './ArtistStats';
import { api } from '../../services/api';
import { useAPI } from '../../services/hooks';
import FullscreenCentered from '../../components/FullscreenCentered';

export default function ArtistStatsWrapper() {
  const params = useParams();
  const stats = useAPI(api.getArtistStats, params.id || '');

  if (stats === null) {
    return (
      <FullscreenCentered>
        <CircularProgress />
        <div>
          <h3>Loading your stats</h3>
        </div>
      </FullscreenCentered>
    );
  }

  if ('code' in stats) {
    return (
      <FullscreenCentered>
        <h3>You never listened to this artist, might be someone else registered</h3>
      </FullscreenCentered>
    );
  }

  return <ArtistStats stats={stats} />;
}
