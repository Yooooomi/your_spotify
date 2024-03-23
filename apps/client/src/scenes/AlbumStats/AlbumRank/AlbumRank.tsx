import { CircularProgress } from "@mui/material";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import InlineAlbum from "../../../components/InlineAlbum";
import Text from "../../../components/Text";
import { api } from "../../../services/apis/api";
import { useLoadAlbums } from "../../../services/hooks/artist";
import { useAPI } from "../../../services/hooks/hooks";
import s from "./index.module.css";

interface AlbumRankProps {
  albumId: string;
}

export default function AlbumRank({ albumId }: AlbumRankProps) {
  const albumRank = useAPI(api.getAlbumRank, albumId);

  const ids = useMemo(
    () => albumRank?.results.map(r => r.id) ?? [],
    [albumRank?.results],
  );
  const { albums, loaded } = useLoadAlbums(ids);

  const getArtist = useCallback((id: string) => albums[id], [albums]);
  if (!albumRank || !loaded) {
    return (
      <div className={s.loading}>
        <CircularProgress size={24} />
        <Text>Album rank is loading</Text>
      </div>
    );
  }

  return (
    <div className={s.ranks}>
      {albumRank.results.map((rank, k, a) => (
        <div
          key={rank.id}
          className={clsx(s.rank, {
            [s.before]:
              !albumRank.isMax &&
              ((albumRank.isMin && k < 2) || (!albumRank.isMin && k === 0)),
            [s.after]:
              !albumRank.isMin &&
              ((albumRank.isMax && k > 0) || (!albumRank.isMax && k === 2)),
            [s.actual]:
              (albumRank.isMax && k === 0) ||
              (albumRank.isMin && k === a.length - 1) ||
              (!albumRank.isMax && !albumRank.isMin && k === 1),
          })}>
          #
          {albumRank.index +
            k +
            (albumRank.isMax ? 1 : 0) +
            (albumRank.isMin ? -1 : 0)}{" "}
          <InlineAlbum album={getArtist(rank.id)!} noStyle />
        </div>
      ))}
    </div>
  );
}
