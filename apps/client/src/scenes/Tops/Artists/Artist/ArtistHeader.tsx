import { useMemo } from "react";
import Text from "../../../../components/Text";
import { useMobile } from "../../../../services/hooks/hooks";
import { ColumnDescription, GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useArtistGrid } from "./ArtistGrid";

export default function ArtistHeader() {
  const [, isTablet] = useMobile();
  const artistGrid = useArtistGrid();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      { ...artistGrid.cover, node: <div /> },
      {
        ...artistGrid.title,
        node: <Text>Artist name</Text>,
      },
      {
        ...artistGrid.genres,
        node: !isTablet && <Text>Genres</Text>,
      },
      {
        ...artistGrid.count,
        node: <Text>Count</Text>,
      },
      {
        ...artistGrid.total,
        node: <Text className="center">Total</Text>,
      },
    ],
    [
      artistGrid.count,
      artistGrid.cover,
      artistGrid.genres,
      artistGrid.title,
      artistGrid.total,
      isTablet,
    ],
  );

  return <GridRowWrapper columns={columns} className={s.header} />;
}
