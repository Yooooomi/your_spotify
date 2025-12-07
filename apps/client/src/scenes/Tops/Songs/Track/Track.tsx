import { Fragment } from "react";
import clsx from "clsx";
import { msToDuration } from "../../../../services/stats";
import { Artist, Album, Track as TrackType } from "../../../../services/types";
import InlineArtist from "../../../../components/InlineArtist";
import InlineTrack from "../../../../components/InlineTrack";
import Text from "../../../../components/Text";
import PlayButton from "../../../../components/PlayButton";
import TrackOptions from "../../../../components/TrackOptions";
import { useMobile } from "../../../../services/hooks/hooks";
import { GridRowWrapper } from "../../../../components/Grid";
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
  rank: number;
}

export default function Track(props: TrackProps) {
  const [isMobile, isTablet, isDesktop] = useMobile();
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
    rank
  } = props;

  const columns = [
    {
      ...trackGrid.rank,
      node: (
        <Text size="normal" element="strong" className={s.mlrank}>
          #{rank}
        </Text>
      )
    },
    {
      ...trackGrid.cover,
      node: playable && <PlayButton id={track.id} covers={album.images} />,
    },
    {
      ...trackGrid.title,
      node: (
        <div className={clsx("otext", s.names)}>
          <InlineTrack element="div" track={track} size='normal' />
          <div className="subtitle">
            {artists.map((art, k, a) => (
              <Fragment key={art.id}>
                <InlineArtist artist={art} noStyle size='normal' />
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
        <InlineAlbum element="div" className="otext" album={album} size='normal' />
      ),
    },
    {
      ...trackGrid.duration,
      node: !isMobile && (
        <Text element="div" size='normal'>{msToDuration(track.duration_ms)}</Text>
      ),
    },
    {
      ...trackGrid.count,
      node: (
        <Text element="div" size="normal" className={isMobile ? "right" : undefined}>
          {count}
          {!isMobile && (
            <>
              {" "}
              <Text size="normal">({Math.floor((count / totalCount) * 10000) / 100}%)</Text>
            </>
          )}
        </Text>
      ),
    },
    {
      ...trackGrid.total,
      node: !isMobile && (
        <Text element="div" className="center" size='normal'>
          {msToDuration(duration)}
          {isDesktop && (
            <>
              {" "}
              <Text size="normal">
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
  ];

  return (
    <LongClickableTrack track={track}>
      <GridRowWrapper
        columns={columns}
        className={clsx("play-button-holder", s.row)}
      />
    </LongClickableTrack>
  );
}
