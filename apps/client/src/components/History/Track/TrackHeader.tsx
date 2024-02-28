import { useMemo } from "react";
import Text from "../../Text";
import { ColumnDescription, GridRowWrapper } from "../../Grid";
import { useMobile } from "../../../services/hooks/hooks";
import s from "./index.module.css";
import { trackGrid } from "./TrackGrid";

export default function TrackHeader() {
  const [isMobile, isTablet] = useMobile();

  const columns = useMemo<ColumnDescription[]>(
    () => [
      { ...trackGrid.cover, node: <div /> },
      {
        ...trackGrid.title,
        node: <Text>Title</Text>,
      },
      {
        ...trackGrid.album,
        node: !isTablet && <Text>Album name</Text>,
      },
      {
        ...trackGrid.duration,
        node: !isMobile && <Text>Duration</Text>,
      },
      {
        ...trackGrid.listened,
        node: !isMobile && <Text>Listened at</Text>,
      },
      {
        ...trackGrid.option,
        node: !isMobile && <div className="center" />,
      },
    ],
    [isMobile, isTablet],
  );

  return <GridRowWrapper className={s.header} columns={columns} />;
}
