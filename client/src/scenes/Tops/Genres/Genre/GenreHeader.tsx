import { useMemo } from 'react';
import Text from '../../../../components/Text';
import { useMobile } from '../../../../services/hooks/hooks';
import { ColumnDescription, GridRowWrapper } from '../../../../components/Grid';
import s from './index.module.css';
import { useGenreGrid } from './GenreGrid';

export default function GenreHeader() {
  const [, isTablet] = useMobile();
  const genreGrid = useGenreGrid();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      { ...genreGrid.cover, node: <div /> },
      {
        ...genreGrid.title,
        node: <Text>Genre name</Text>,
      },
      {
        ...genreGrid.artists,
        node: !isTablet && <Text>Artists</Text>,
      },
      {
        ...genreGrid.count,
        node: <Text>Count</Text>,
      },
      {
        ...genreGrid.total,
        node: <Text className="center">Total duration</Text>,
      },
    ],
    [
      genreGrid.cover,
      genreGrid.title,
      genreGrid.artists,
      genreGrid.count,
      genreGrid.total,
      isTablet,
    ],
  );

  return <GridRowWrapper columns={columns} className={s.header} />;
}
