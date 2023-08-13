import { useMemo } from 'react';
import Text from '../../../../components/Text';
import { useMobile } from '../../../../services/hooks/hooks';
import s from './index.module.css';
import { ColumnDescription, GridRowWrapper } from '../../../../components/Grid';
import { useTrackGrid } from './TrackGrid';

export default function TrackHeader() {
  const [isMobile, isTablet] = useMobile();
  const trackGrid = useTrackGrid();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...trackGrid.cover,
        node: <div aria-label="cover" />,
      },
      {
        ...trackGrid.title,
        node: <Text element="div">Title</Text>,
      },
      {
        ...trackGrid.album,
        node: !isTablet && <Text element="div">Album name</Text>,
      },
      {
        ...trackGrid.duration,
        node: !isMobile && <Text element="div">Duration</Text>,
      },
      {
        ...trackGrid.count,
        node: <Text element="div">Count</Text>,
      },
      {
        ...trackGrid.total,
        node: (
          <Text element="div" className="center">
            Total
          </Text>
        ),
      },
      {
        ...trackGrid.options,
        node: !isMobile && <div aria-label="option-menu" />,
      },
    ],
    [
      isMobile,
      isTablet,
      trackGrid.album,
      trackGrid.count,
      trackGrid.cover,
      trackGrid.duration,
      trackGrid.options,
      trackGrid.title,
      trackGrid.total,
    ],
  );

  return <GridRowWrapper columns={columns} className={s.header} />;
}
