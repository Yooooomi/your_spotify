import Text from "../../../../components/Text";
import { GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useAlbumGrid } from "./AlbumGrid";
import { useMobile } from "../../../../services/hooks/hooks";

export default function AlbumHeader() {
  const [isMobile] = useMobile()
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
      node: !isMobile && <Text size="normal" className="center">Total</Text>,
    },
  ];

  return <GridRowWrapper columns={columns} className={s.header} />;
}
