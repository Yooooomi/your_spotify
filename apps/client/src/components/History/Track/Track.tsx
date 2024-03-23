import { Fragment, useMemo } from "react";
import clsx from "clsx";
import { msToMinutesAndSeconds } from "../../../services/stats";
import { Album, Artist, Track as TrackType } from "../../../services/types";
import InlineArtist from "../../InlineArtist";
import Text from "../../Text";
import TrackOptions from "../../TrackOptions";
import InlineTrack from "../../InlineTrack";
import { ColumnDescription, GridRowWrapper } from "../../Grid";
import PlayButton from "../../PlayButton";
import { useMobile } from "../../../services/hooks/hooks";
import LongClickableTrack from "../../LongClickableTrack";
import InlineAlbum from "../../InlineAlbum";
import { DateFormatter } from "../../../services/date";
import { trackGrid } from "./TrackGrid";
import s from "./index.module.css";

interface TrackProps {
  listenedAt?: Date;
  track: TrackType;
  artists: Artist[];
  album: Album;
}

export default function Track({
  track,
  album,
  artists,
  listenedAt,
}: TrackProps) {
  const [isMobile, isTablet] = useMobile();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...trackGrid.cover,
        node: <PlayButton id={track.id} covers={album.images} />,
      },
      {
        ...trackGrid.title,
        node: (
          <div className={clsx("otext", s.names)}>
            <InlineTrack track={track} element="div" />
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
        node: !isTablet && <InlineAlbum className="otext" album={album} />,
      },
      {
        ...trackGrid.duration,
        node: !isMobile && (
          <Text>{msToMinutesAndSeconds(track.duration_ms)}</Text>
        ),
      },
      {
        ...trackGrid.listened,
        node: listenedAt && !isMobile && (
          <Text>{DateFormatter.listenedAt(listenedAt)}</Text>
        ),
      },
      {
        ...trackGrid.option,
        node: !isMobile && <TrackOptions track={track} />,
      },
    ],
    [album, artists, isMobile, isTablet, listenedAt, track],
  );

  return (
    <LongClickableTrack track={track}>
      <GridRowWrapper
        className={clsx("play-button-holder", s.row)}
        columns={columns}
      />
    </LongClickableTrack>
  );
}
