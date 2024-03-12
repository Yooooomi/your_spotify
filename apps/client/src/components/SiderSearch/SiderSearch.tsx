import { Popper, Paper } from "@mui/material";
import clsx from "clsx";
import { useRef, useState, useCallback } from "react";
import { api } from "../../services/apis/api";
import { useConditionalAPI } from "../../services/hooks/hooks";
import { Album, Artist, TrackWithFullAlbum } from "../../services/types";
import IdealImage from "../IdealImage";
import Loader from "../Loader";
import Text from "../Text";
import s from "./index.module.css";

interface SiderSearchProps {
  onTrackClick?: (track: TrackWithFullAlbum) => void;
  onArtistClick?: (artist: Artist) => void;
  onAlbumClick?: (album: Album) => void;
  inputClassname?: string;
}

export default function SiderSearch({
  onTrackClick,
  onArtistClick,
  onAlbumClick,
  inputClassname,
}: SiderSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [results, loading] = useConditionalAPI(
    search.length >= 3,
    api.search,
    search,
  );

  const internOnTrackClick = useCallback(
    (track: TrackWithFullAlbum) => {
      setSearch("");
      onTrackClick?.(track);
    },
    [onTrackClick],
  );

  const internOnArtistClick = useCallback(
    (artist: Artist) => {
      setSearch("");
      onArtistClick?.(artist);
    },
    [onArtistClick],
  );

  const internOnAlbumClick = useCallback(
    (album: Album) => {
      setSearch("");
      onAlbumClick?.(album);
    },
    [onAlbumClick],
  );

  const totalResults = results
    ? results.artists.length + results.tracks.length + results.albums.length
    : 0;
  const displayAll = Boolean(onArtistClick) && Boolean(onTrackClick);

  return (
    <>
      <input
        className={clsx(s.input, inputClassname)}
        placeholder="Search..."
        value={search}
        onChange={ev => setSearch(ev.target.value)}
        ref={inputRef}
      />
      <Popper
        open={search.length > 0}
        anchorEl={inputRef.current}
        placement="bottom"
        className={s.popper}>
        <Paper
          className={s.results}
          style={{ width: inputRef.current?.clientWidth }}>
          {loading && results === null && <Loader className={s.alert} />}
          {!loading && search.length < 3 && (
            <Text className={s.alert} element="strong">
              At least 3 characters
            </Text>
          )}
          {!loading && search.length >= 3 && totalResults === 0 && (
            <Text className={s.alert} element="strong">
              No results found
            </Text>
          )}
          {displayAll && (results?.artists.length ?? 0) > 0 && (
            <Text element="div" className={s.section}>
              Artists
            </Text>
          )}
          {onArtistClick &&
            results?.artists.map(res => (
              <button
                type="button"
                key={res.id}
                className={clsx("no-button", s.result)}
                onClick={() => internOnArtistClick(res)}>
                <IdealImage
                  className={s.resultimage}
                  images={res.images}
                  size={48}
                  alt="Artist"
                />
                <Text element="strong">{res.name}</Text>
              </button>
            ))}
          {displayAll && (results?.tracks.length ?? 0) > 0 && (
            <Text element="div" className={s.section}>
              Tracks
            </Text>
          )}
          {onTrackClick &&
            results?.tracks.map(res => (
              <button
                type="button"
                key={res.id}
                className={clsx("no-button", s.result)}
                onClick={() => internOnTrackClick(res)}>
                <IdealImage
                  className={s.resultimage}
                  images={res.full_album.images}
                  size={48}
                  alt="Album"
                />
                <Text element="strong">{res.name}</Text>
              </button>
            ))}
          {displayAll && (results?.albums.length ?? 0) > 0 && (
            <Text element="div" className={s.section}>
              Albums
            </Text>
          )}
          {onAlbumClick &&
            results?.albums.map(res => (
              <button
                type="button"
                key={res.id}
                className={clsx("no-button", s.result)}
                onClick={() => internOnAlbumClick(res)}>
                <IdealImage
                  className={s.resultimage}
                  images={res.images}
                  size={48}
                  alt="Album"
                />
                <Text element="strong">{res.name}</Text>
              </button>
            ))}
        </Paper>
      </Popper>
    </>
  );
}
