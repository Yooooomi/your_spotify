import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { api } from "../../services/apis/api";
import { useAPI } from "../../services/hooks/hooks";
import FullscreenCentered from "../../components/FullscreenCentered";
import Text from "../../components/Text";
import ArtistStats from "./ArtistStats";

export default function ArtistStatsWrapper() {
  const params = useParams();
  const stats = useAPI(api.getArtistStats, params.id || "");

  if (stats === null) {
    return (
      <FullscreenCentered>
        <CircularProgress />
        <div>
          <Text element="h3">Loading your stats</Text>
        </div>
      </FullscreenCentered>
    );
  }

  if ("code" in stats || !params.id) {
    return (
      <FullscreenCentered>
        <Text element="h3">
          You never listened to this artist, might be someone else registered
        </Text>
      </FullscreenCentered>
    );
  }

  return <ArtistStats artistId={params.id} stats={stats} />;
}
