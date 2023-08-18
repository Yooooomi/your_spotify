import { useState } from 'react';
import { Button } from '@mui/material';
import TitleCard from '../../../components/TitleCard';
import { getSpotifyLogUrl } from '../../../services/tools';
import SettingLine from '../SettingLine';
import CheckboxWithText from '../../../components/CheckboxWithText/CheckboxWithText';

export default function RelogToSpotify() {
  const [readOnlyPermission, setReadOnlyPermission] = useState(false);

  return (
    <TitleCard title="Miscellaneous">
      <SettingLine
        left="Relog to Spotify"
        right={
          <Button>
            <a href={getSpotifyLogUrl(readOnlyPermission)}>Relog</a>
          </Button>
        }
      />
      <CheckboxWithText
        checked={readOnlyPermission}
        onChecked={setReadOnlyPermission}
        text="Restrict permissions to read-only access"
      />
    </TitleCard>
  );
}
