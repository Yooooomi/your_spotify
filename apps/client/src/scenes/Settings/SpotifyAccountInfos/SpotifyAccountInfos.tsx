import TitleCard from "../../../components/TitleCard";
import { SpotifyMe } from "../../../services/types";
import SettingLine from "../SettingLine";

interface SpotifyAccountInfosProps {
  spotifyAccount: SpotifyMe;
}

export default function SpotifyAccountInfos({
  spotifyAccount,
}: SpotifyAccountInfosProps) {
  return (
    <TitleCard title="Linked Spotify account">
      <SettingLine left="Id" right={spotifyAccount.id} />
      <SettingLine left="Display name" right={spotifyAccount.display_name} />
    </TitleCard>
  );
}
