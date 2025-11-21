import Text from "../../../../components/Text";
import { GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useAlbumGrid } from "./AlbumGrid";

export default function AlbumHeader() {
  const albumGrid = useAlbumGrid();

  const columns = [
      {
        ...albumGrid.cover,
        node: <div />,
      },
      {
        ...albumGrid.title,
        node: <Text size="normal">Album name</Text>,
      },
      {
        ...albumGrid.count,
        node: <Text size="normal">Count</Text>,
      },
      {
        ...albumGrid.total,
        node: <Text className="center" size='normal'>Total</Text>,
      },
    ];

  return <GridRowWrapper columns={columns} className={s.header} />;
}
