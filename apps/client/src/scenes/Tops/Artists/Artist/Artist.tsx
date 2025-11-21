import { msToDuration } from "../../../../services/stats";
import { Artist as ArtistType } from "../../../../services/types";
import InlineArtist from "../../../../components/InlineArtist";
import Text from "../../../../components/Text";
import { useMobile } from "../../../../services/hooks/hooks";
import { GridRowWrapper } from "../../../../components/Grid";
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

  const columns = [
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
          <Text className="otext" size='normal'>
            <InlineArtist artist={artist} size='normal' />
          </Text>
        ),
      },
      {
        ...artistGrid.genres,
        node: !isTablet && (
          <Text className="otext" title={genres} size='normal'>
            {genres}
          </Text>
        ),
      },
      {
        ...artistGrid.count,
        node: (
          <Text size="normal">
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
        node: (
          <Text className="center" size='normal'>
            {msToDuration(duration)}
            {!isMobile && (
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
