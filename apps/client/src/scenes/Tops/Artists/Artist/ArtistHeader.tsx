import { useMemo } from "react";
import Text from "../../../../components/Text";
import { useMobile } from "../../../../services/hooks/hooks";
import { ColumnDescription, GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useArtistGrid } from "./ArtistGrid";
import { useDispatch } from "react-redux";
import { setSortKey } from "../../../../services/redux/modules/user/reducer";

export default function ArtistHeader() {
  const [, isTablet] = useMobile();
  const artistGrid = useArtistGrid();
  const dispatch = useDispatch();
  
  const handleClick = (value: string) =>{
    dispatch(setSortKey(value));
  }

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
        node: <Text onClick={() => {handleClick("count")}}>Count</Text>,
      },
      {
        ...artistGrid.total,
        node: <Text className="center" onClick={() => {handleClick("duration_ms")}}>Total</Text>,
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
