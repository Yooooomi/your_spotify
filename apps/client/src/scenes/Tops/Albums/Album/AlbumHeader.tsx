import { useMemo } from "react";
import Text from "../../../../components/Text";
import { ColumnDescription, GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useAlbumGrid } from "./AlbumGrid";
import { setSortKey } from "../../../../services/redux/modules/user/reducer";
import { useDispatch } from "react-redux";

export default function AlbumHeader() {
  const albumGrid = useAlbumGrid();
  const dispatch = useDispatch();
  
  const handleClick = (value: string) =>{
    dispatch(setSortKey(value));
  }

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
        node: <Text onClick={() => {handleClick("count")}}>Count</Text>,
      },
      {
        ...albumGrid.total,
        node: <Text className="center" onClick={() => {handleClick("duration_ms")}}>Total</Text>,
      },
    ],
    [albumGrid.count, albumGrid.cover, albumGrid.title, albumGrid.total],
  );

  return <GridRowWrapper columns={columns} className={s.header} />;
}
