import { useMemo } from 'react';
import s from './index.module.css';
import { msToMinutesAndSeconds } from '../../../../services/stats';
import { Genre as GenreType } from '../../../../services/types';
import Text from '../../../../components/Text';
import InlineArtist from '../../../../components/InlineArtist';
import { useMobile } from '../../../../services/hooks/hooks';
import { useGenreGrid } from './GenreGrid';
import { ColumnDescription, GridRowWrapper } from '../../../../components/Grid';

interface GenreProps {
  genre: GenreType;
  count: number;
  totalCount: number;
  duration: number;
  totalDuration: number;
}

function genreToImageAsBase64(genre: string) {
  // Calc hash from genre name
  let hash = 0;
  for (let i = 0; i < genre.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = genre.charCodeAt(i) + (hash << 5) - hash;
  }

  // Generate RGB color components from the hash value
  // eslint-disable-next-line no-bitwise
  const r = (hash & 0xff0000) >> 16;
  // eslint-disable-next-line no-bitwise
  const g = (hash & 0x00ff00) >> 8;
  // eslint-disable-next-line no-bitwise
  const b = hash & 0x0000ff;
  const color = `rgb(${r},${g},${b})`;

  // Create canvas with genre letter on top of a colored rectangle
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    // Set canvas dimensions
    const width = 48; // commonUnits.cover
    const height = 48;
    canvas.width = width;
    canvas.height = height;

    // Draw colored rectangle
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    // Draw letter on top of the rectangle
    context.font = '30px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(genre[0].toUpperCase(), width / 2, height / 2);

    // Convert canvas to image data URL
    const imageDataURL = canvas.toDataURL();

    return imageDataURL;
  }
  return '/no_data_faded.png'; // from tools.ts
}

export default function Genre({
  genre,
  duration,
  totalDuration,
  count,
  totalCount,
}: GenreProps) {
  const [isMobile, isTablet] = useMobile();
  const genreGrid = useGenreGrid();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...genreGrid.cover,
        node: (
          <img
            alt="Artist cover"
            src={genreToImageAsBase64(genre.name)}
            className={s.cover}
            height={48}
            width={48}
          />
        ),
      },
      {
        ...genreGrid.title,
        node: <Text className="otext">{genre.name}</Text>,
      },
      {
        ...genreGrid.artists,
        node: !isTablet && (
          <Text
            className="otext"
            title={genre.artists.map(a => a.name).join(', ')}>
            {genre.artists.map((artist, i) => (
              <>
                <InlineArtist artist={artist} />
                {i + 1 < genre.artists.length && ', '}
              </>
            ))}
          </Text>
        ),
      },
      {
        ...genreGrid.count,
        node: (
          <Text>
            {count.toFixed(1)}
            {!isMobile && (
              <>
                {' '}
                <Text>({Math.floor((count / totalCount) * 10000) / 100})%</Text>
              </>
            )}
          </Text>
        ),
      },
      {
        ...genreGrid.total,
        node: (
          <Text className="center">
            {msToMinutesAndSeconds(duration)}
            {!isMobile && (
              <>
                {' '}
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
      genre,
      genreGrid.cover,
      genreGrid.title,
      genreGrid.artists,
      genreGrid.count,
      genreGrid.total,
      count,
      duration,
      isMobile,
      isTablet,
      totalCount,
      totalDuration,
    ],
  );

  return <GridRowWrapper className={s.row} columns={columns} />;
}
