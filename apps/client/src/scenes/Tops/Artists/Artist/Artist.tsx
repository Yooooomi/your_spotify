import { useMemo } from "react";
import { msToDuration } from "../../../../services/stats";
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
  rank: number;
}

export default function Artist({
  artist,
  duration,
  totalDuration,
  count,
  totalCount,
  rank
}: ArtistProps) {
  const [isMobile, isTablet, isDesktop] = useMobile();
  const artistGrid = useArtistGrid();

  const genres = artist.genres.join(", ");

  const columns: ColumnDescription[] = [
    {
      ...artistGrid.rank,
      node: (
        <Text size="normal" element="strong" className={s.mlrank}>
          #{rank}
        </Text>
      )
    },
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
        <Text size="normal" className="otext">
          <InlineArtist size="normal" artist={artist} />
        </Text>
      ),
    },
    {
      ...artistGrid.genres,
      node: !isTablet && (
        <Text size="normal" className="otext" title={genres}>
          {genres}
        </Text>
      ),
    },
    {
      ...artistGrid.count,
      node: (
        <Text size="normal" className={isMobile ? "right" : undefined}>
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
      ...artistGrid.total,
      node: !isMobile && (
        <Text size="normal" className="center">
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
  ];

  return <GridRowWrapper className={s.row} columns={columns} />;
}
