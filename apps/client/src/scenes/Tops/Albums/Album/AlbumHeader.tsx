import { useMemo } from "react";
import Text from "../../../../components/Text";
import { ColumnDescription, GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useAlbumGrid } from "./AlbumGrid";

export default function AlbumHeader() {
  const albumGrid = useAlbumGrid();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      {
        ...albumGrid.cover,
        node: <div />,
      },
      {
        ...albumGrid.title,
        node: <Text>Album name</Text>,
      },
      {
        ...albumGrid.count,
        node: <Text>Count</Text>,
      },
      {
        ...albumGrid.total,
        node: <Text className="center">Total</Text>,
      },
    ],
    [albumGrid.count, albumGrid.cover, albumGrid.title, albumGrid.total],
  );

  return <GridRowWrapper columns={columns} className={s.header} />;
}
