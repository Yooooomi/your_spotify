import Text from "../../../../components/Text";
import { useMobile } from "../../../../services/hooks/hooks";
import { GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useArtistGrid } from "./ArtistGrid";

export default function ArtistHeader() {
  const [isMobile, isTablet] = useMobile();
  const artistGrid = useArtistGrid();

  const columns = [
    { ...artistGrid.cover, node: <div /> },
    {
      ...artistGrid.title,
      node: <Text size="normal">Artist name</Text>,
    },
    {
      ...artistGrid.genres,
      node: !isTablet && <Text size="normal">Genres</Text>,
    },
    {
      ...artistGrid.count,
      node: <Text size="normal">Count</Text>,
    },
    {
      ...artistGrid.total,
      node: !isMobile && (
        <Text className="center" size="normal">
          Total
        </Text>
      ),
    },
  ];

  return <GridRowWrapper columns={columns} className={s.header} />;
}
