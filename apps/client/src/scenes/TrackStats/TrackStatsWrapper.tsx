import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { api } from "../../services/apis/api";
import { useAPI } from "../../services/hooks/hooks";
import FullscreenCentered from "../../components/FullscreenCentered";
import Text from "../../components/Text";
import SongStats from "./TrackStats";

export default function TrackStatsWrapper() {
  const params = useParams();
  const stats = useAPI(api.getTrackStats, params.id || '');

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

  if ("code" in stats || !params.id) {
    return (
      <FullscreenCentered>
        <Text element="h3" size='big'>
          You never listened to this song, might be someone else registered
        </Text>
      </FullscreenCentered>
    );
  }

  return <SongStats trackId={params.id} stats={stats} />;
}
