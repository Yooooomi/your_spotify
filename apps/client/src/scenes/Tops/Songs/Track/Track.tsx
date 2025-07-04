import { Fragment, useMemo } from "react";
import clsx from "clsx";
import { msToDuration } from "../../../../services/stats";
import { Artist, Album, Track as TrackType } from "../../../../services/types";
import InlineArtist from "../../../../components/InlineArtist";
import InlineTrack from "../../../../components/InlineTrack";
import Text from "../../../../components/Text";
import PlayButton from "../../../../components/PlayButton";
import TrackOptions from "../../../../components/TrackOptions";
import { useMobile } from "../../../../services/hooks/hooks";
import { ColumnDescription, GridRowWrapper } from "../../../../components/Grid";
import InlineAlbum from "../../../../components/InlineAlbum";
import LongClickableTrack from "../../../../components/LongClickableTrack";
import s from "./index.module.css";
import { useTrackGrid } from "./TrackGrid";

interface TrackProps {
  track: TrackType;
  artists: Artist[];
  album: Album;
  playable?: boolean;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

export default function Track(props: TrackProps) {
  const [isMobile, isTablet] = useMobile();
  const trackGrid = useTrackGrid();

  const {
    track,
    album,
    artists,
    playable,
    duration,
    totalDuration,
    count,
    totalCount,
  } = props;

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...trackGrid.cover,
        node: playable && <PlayButton id={track.id} covers={album.images} />,
      },
      {
        ...trackGrid.title,
        node: (
          <div className={clsx("otext", s.names)}>
            <InlineTrack element="div" track={track} />
            <div className="subtitle">
              {artists.map((art, k, a) => (
                <Fragment key={art.id}>
                  <InlineArtist artist={art} noStyle />
                  {k !== a.length - 1 && ", "}
                </Fragment>
              ))}
            </div>
          </div>
        ),
      },
      {
        ...trackGrid.album,
        node: !isTablet && (
          <InlineAlbum element="div" className="otext" album={album} />
        ),
      },
      {
        ...trackGrid.duration,
        node: !isMobile && (
          <Text element="div">{msToDuration(track.duration_ms)}</Text>
        ),
      },
      {
        ...trackGrid.count,
        node: (
          <Text element="div">
            {count}
            {!isMobile && (
              <>
                {" "}
                <Text>({Math.floor((count / totalCount) * 10000) / 100}%)</Text>
              </>
            )}
          </Text>
        ),
      },
      {
        ...trackGrid.total,
        node: (
          <Text element="div" className="center">
            {msToDuration(duration)}
            {!isMobile && (
              <>
                {" "}
                <Text>
                  ({Math.floor((duration / totalDuration) * 10000) / 100}%)
                </Text>
              </>
            )}
          </Text>
        ),
      },
      {
        ...trackGrid.options,
        node: !isMobile && <TrackOptions track={track} />,
      },
    ],
    [
      album,
      artists,
      count,
      duration,
      isMobile,
      isTablet,
      playable,
      totalCount,
      totalDuration,
      track,
      trackGrid.album,
      trackGrid.count,
      trackGrid.cover,
      trackGrid.duration,
      trackGrid.options,
      trackGrid.title,
      trackGrid.total,
    ],
  );

  return (
    <LongClickableTrack track={track}>
      <GridRowWrapper
        columns={columns}
        className={clsx("play-button-holder", s.row)}
      />
    </LongClickableTrack>
  );
}
