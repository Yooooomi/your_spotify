import { CircularProgress } from "@mui/material";
import clsx from "clsx";
import InlineArtist from "../../../components/InlineArtist";
import Text from "../../../components/Text";
import { api } from "../../../services/apis/api";
import { useLoadArtists } from "../../../services/hooks/artist";
import { useAPI } from "../../../services/hooks/hooks";
import s from "./index.module.css";

interface ArtistRankProps {
  artistId: string;
}

export default function ArtistRank({ artistId }: ArtistRankProps) {
  const artistRank = useAPI(api.getArtistRank, artistId);

  const ids = artistRank?.results.map(r => r.id) ?? [];
  const { artists, loaded } = useLoadArtists(ids);

  const getArtist = (id: string) => artists[id];

  if (!artistRank || !loaded) {
    return (
      <div className={s.loading}>
        <CircularProgress size={24} />
        <Text size="normal">Artist rank is loading</Text>
      </div>
    );
  }

  return (
    <div className={s.ranks}>
      {artistRank.results.map((rank, k, a) => (
        <div
          key={rank.id}
          className={clsx(s.rank, {
            [s.before]:
              !artistRank.isMax &&
              ((artistRank.isMin && k < 2) || (!artistRank.isMin && k === 0)),
            [s.after]:
              !artistRank.isMin &&
              ((artistRank.isMax && k > 0) || (!artistRank.isMax && k === 2)),
            [s.actual]:
              (artistRank.isMax && k === 0) ||
              (artistRank.isMin && k === a.length - 1) ||
              (!artistRank.isMax && !artistRank.isMin && k === 1),
          })}>
          #
          {artistRank.index +
            k +
            (artistRank.isMax ? 1 : 0) +
            (artistRank.isMin ? -1 : 0)}{" "}
          <InlineArtist size="normal" artist={getArtist(rank.id)!} noStyle />
        </div>
      ))}
    </div>
  );
}
