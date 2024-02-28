import { CircularProgress } from "@mui/material";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import InlineTrack from "../../../components/InlineTrack";
import Text from "../../../components/Text";
import { api } from "../../../services/apis/api";
import { useAPI } from "../../../services/hooks/hooks";
import { useTracks } from "../../../services/track";
import s from "./index.module.css";

interface TrackRankProps {
  trackId: string;
}

export default function TrackRank({ trackId }: TrackRankProps) {
  const trackRank = useAPI(api.getTrackRank, trackId);

  const ids = useMemo(
    () => trackRank?.results.map(r => r.id) ?? [],
    [trackRank?.results],
  );
  const { loaded, tracks } = useTracks(ids);

  const getTrack = useCallback((id: string) => tracks[id], [tracks]);

  if (!trackRank || !loaded) {
    return (
      <div className={s.loading}>
        <CircularProgress size={24} />
        <Text>Song rank is loading</Text>
      </div>
    );
  }

  return (
    <div className={s.ranks}>
      {trackRank.results.map((rank, k, a) => {
        const track = getTrack(rank.id);
        return (
          <div
            key={rank.id}
            className={clsx(s.rank, {
              [s.before]:
                !trackRank.isMax &&
                ((trackRank.isMin && k < 2) || (!trackRank.isMin && k === 0)),
              [s.after]:
                !trackRank.isMin &&
                ((trackRank.isMax && k > 0) || (!trackRank.isMax && k === 2)),
              [s.actual]:
                (trackRank.isMax && k === 0) ||
                (trackRank.isMin && k === a.length - 1) ||
                (!trackRank.isMax && !trackRank.isMin && k === 1),
            })}>
            #
            {trackRank.index +
              k +
              (trackRank.isMax ? 1 : 0) +
              (trackRank.isMin ? -1 : 0)}{" "}
            {track ? <InlineTrack track={track} noStyle /> : null}
          </div>
        );
      })}
    </div>
  );
}
