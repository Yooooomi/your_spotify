import { Fragment } from 'react';
import s from './index.module.css';
import { msToDuration } from '../../../../services/stats';
import { Artist, Album as AlbumType } from '../../../../services/types';
import InlineArtist from '../../../../components/InlineArtist';
import Text from '../../../../components/Text';
import { useMobile } from '../../../../services/hooks/hooks';
import { ColumnDescription, GridRowWrapper } from '../../../../components/Grid';
import IdealImage from '../../../../components/IdealImage';
import { useAlbumGrid } from './AlbumGrid';
import InlineAlbum from '../../../../components/InlineAlbum';

interface AlbumProps {
  artists: Artist[];
  album: AlbumType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
  rank: number;
}

export default function Album({
  album,
  artists,
  duration,
  totalDuration,
  count,
  totalCount,
  rank
}: AlbumProps) {
  const [isMobile, _, isDesktop] = useMobile();
  const albumGrid = useAlbumGrid();

  const columns: ColumnDescription[] = [
    {
      ...albumGrid.rank,
      node: (
        <Text size="normal" element="strong" className={s.mlrank}>
          #{rank}
        </Text>
      )
    },
    {
      ...albumGrid.cover,
      node: (
        <IdealImage
          className={s.cover}
          images={album.images}
          alt="Album cover"
          size={48}
          width={48}
          height={48}
        />
      ),
    },
    {
      ...albumGrid.title,
      node: (
        <div className={s.names}>
          <div>
            <InlineAlbum size="normal" album={album} />
          </div>
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
      ...albumGrid.count,
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
      ...albumGrid.total,
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

  return <GridRowWrapper columns={columns} />;
}
