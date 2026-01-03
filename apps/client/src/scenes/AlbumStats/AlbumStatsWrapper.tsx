import { CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import AlbumStats from './AlbumStats';
import { api } from '../../services/apis/api';
import { useAPI } from '../../services/hooks/hooks';
import FullscreenCentered from '../../components/FullscreenCentered';
import Text from '../../components/Text';

export default function AlbumStatsWrapper() {
  const params = useParams();
  const stats = useAPI(api.getAlbumStats, params.id || '');

  if (stats === null) {
    return (
      <FullscreenCentered>
        <CircularProgress />
        <div>
          <Text element="h3" size='big'>Loading your stats</Text>
        </div>
      </FullscreenCentered>
    );
  }

  if ('code' in stats || !params.id) {
    return (
      <FullscreenCentered>
        <Text element="h3" size="big">
          You never listened to this album, might be someone else registered
        </Text>
      </FullscreenCentered>
    );
  }

  return <AlbumStats stats={stats} />;
}
