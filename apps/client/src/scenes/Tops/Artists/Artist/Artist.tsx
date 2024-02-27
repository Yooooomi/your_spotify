import { useMemo } from "react";
import { msToMinutesAndSeconds } from "../../../../services/stats";
import { Artist as ArtistType } from "../../../../services/types";
import InlineArtist from "../../../../components/InlineArtist";
import Text from "../../../../components/Text";
import { useMobile } from "../../../../services/hooks/hooks";
import { ColumnDescription, GridRowWrapper } from "../../../../components/Grid";
import IdealImage from "../../../../components/IdealImage";
import s from "./index.module.css";
import { useArtistGrid } from "./ArtistGrid";

interface ArtistProps {
  artist: ArtistType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

export default function Artist({
  artist,
  duration,
  totalDuration,
  count,
  totalCount,
}: ArtistProps) {
  const [isMobile, isTablet] = useMobile();
  const artistGrid = useArtistGrid();

  const genres = artist.genres.join(", ");

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...artistGrid.cover,
        node: (
          <IdealImage
            images={artist.images}
            size={48}
            alt="Artist cover"
            className={s.cover}
            width={48}
            height={48}
          />
        ),
      },
      {
        ...artistGrid.title,
        node: (
          <Text className="otext">
            <InlineArtist artist={artist} />
          </Text>
        ),
      },
      {
        ...artistGrid.genres,
        node: !isTablet && (
          <Text className="otext" title={genres}>
            {genres}
          </Text>
        ),
      },
      {
        ...artistGrid.count,
        node: (
          <Text>
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
        ...artistGrid.total,
        node: (
          <Text className="center">
            {msToMinutesAndSeconds(duration)}
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
    ],
    [
      artist,
      artistGrid.count,
      artistGrid.cover,
      artistGrid.genres,
      artistGrid.title,
      artistGrid.total,
      count,
      duration,
      genres,
      isMobile,
      isTablet,
      totalCount,
      totalDuration,
    ],
  );

  return <GridRowWrapper className={s.row} columns={columns} />;
}
