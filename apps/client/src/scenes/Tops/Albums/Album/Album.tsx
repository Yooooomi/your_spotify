import { Fragment, useMemo } from 'react';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
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
}

export default function Album({
  album,
  artists,
  duration,
  totalDuration,
  count,
  totalCount,
}: AlbumProps) {
  const [isMobile] = useMobile();
  const albumGrid = useAlbumGrid();

  const columns = useMemo<ColumnDescription[]>(
    () => [
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
              <InlineAlbum album={album} />
            </div>
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
        ...albumGrid.count,
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
        ...albumGrid.total,
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
      album.images,
      album.name,
      albumGrid.count,
      albumGrid.cover,
      albumGrid.title,
      albumGrid.total,
      artists,
      count,
      duration,
      isMobile,
      totalCount,
      totalDuration,
    ],
  );

  return <GridRowWrapper columns={columns} />;
}
