import { Fragment } from "react";
import clsx from "clsx";
import { msToDuration } from "../../../services/stats";
import { Album, Artist, Track as TrackType } from "../../../services/types";
import InlineArtist from "../../InlineArtist";
import Text from "../../Text";
import TrackOptions from "../../TrackOptions";
import InlineTrack from "../../InlineTrack";
import { GridRowWrapper } from "../../Grid";
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

  const columns = [
      {
        ...trackGrid.cover,
        node: <PlayButton id={track.id} covers={album.images} />,
      },
      {
        ...trackGrid.title,
        node: (
          <div className={clsx("otext", s.names)}>
            <InlineTrack track={track} size="normal" element="div" />
            <div className="subtitle">
              {artists.map((art, k, a) => (
                <Fragment key={art.id}>
                  <InlineArtist size="normal" artist={art} noStyle />
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
          <InlineAlbum className="otext" size="normal" album={album} />
        ),
      },
      {
        ...trackGrid.duration,
        node: !isMobile && (
          <Text size="normal">{msToDuration(track.duration_ms)}</Text>
        ),
      },
      {
        ...trackGrid.listened,
        node: listenedAt && !isMobile && (
          <Text size="normal">{DateFormatter.listenedAt(listenedAt)}</Text>
        ),
      },
      {
        ...trackGrid.option,
        node: !isMobile && <TrackOptions track={track} />,
      },
    ];

  return (
    <LongClickableTrack track={track}>
      <GridRowWrapper
        className={clsx("play-button-holder", s.row)}
        columns={columns}
      />
    </LongClickableTrack>
  );
}
