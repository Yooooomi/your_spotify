import { useSelector } from "react-redux";
import Header from "../../components/Header";
import { api } from "../../services/apis/api";
import { useAPI } from "../../services/hooks/hooks";
import { selectRawIntervalDetail } from "../../services/redux/modules/user/selector";
import Text from "../../components/Text";
import TitleCard from "../../components/TitleCard";
import Loader from "../../components/Loader";
import s from "./index.module.css";
import LongestSession from "./LongestSession/LongestSession";

export default function LongestSessions() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.getLongestSessions, interval.start, interval.end);

  const validResults = result?.filter(
    res => res.distanceToLast.distance.length >= 1,
  );

  const hasValidSessions = validResults && validResults.length > 0;

  return (
    <div>
      <Header
        title="Longest sessions"
        subtitle="You can find here the 5 longest listening sessions you have been through"
      />
      <div className={s.content}>
        {!result && (
          <Loader
            className={s.loader}
            text="Loading your longest sessions, this can take a bit of time"
          />
        )}
        {result && !hasValidSessions && <Text>No longest session</Text>}
        {hasValidSessions && (
          <TitleCard title="5 longest sessions">
            {validResults.map(r => (
              <LongestSession
                key={r.distanceToLast.distance.map(e => e.info._id).join(",")}
                tracks={r.distanceToLast.distance.map(e => e.info)}
                fullTracks={r.full_tracks}
              />
            ))}
          </TitleCard>
        )}
      </div>
    </div>
  );
}
