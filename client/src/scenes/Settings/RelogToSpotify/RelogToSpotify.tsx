import { Button } from '@mui/material';
import TitleCard from '../../../components/TitleCard';
import { getSpotifyLogUrl } from '../../../services/tools';
import SettingLine from '../SettingLine';

export default function RelogToSpotify() {
  return (
    <TitleCard title="Miscellaneous">
      <SettingLine
        left="Relog to Spotify"
        right={
          <Button>
            <a href={getSpotifyLogUrl()}>Relog</a>
          </Button>
        }
      />
    </TitleCard>
  );
}
