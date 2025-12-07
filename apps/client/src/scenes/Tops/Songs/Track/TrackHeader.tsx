import Text from "../../../../components/Text";
import { useMobile } from "../../../../services/hooks/hooks";
import { GridRowWrapper } from "../../../../components/Grid";
import s from "./index.module.css";
import { useTrackGrid } from "./TrackGrid";

export default function TrackHeader() {
  const [isMobile, isTablet] = useMobile();

  const trackGrid = useTrackGrid();

  const columns = [
      {
        ...trackGrid.cover,
        node: <div aria-label="cover" />,
      },
      {
        ...trackGrid.title,
        node: <Text element="div" size='normal'>Title</Text>,
      },
      {
        ...trackGrid.album,
        node: !isTablet && <Text element="div" size='normal'>Album name</Text>,
      },
      {
        ...trackGrid.duration,
        node: !isMobile && <Text element="div" size='normal'>Duration</Text>,
      },
      {
        ...trackGrid.count,
        node: (
          <div className={s.count}>
            <Text element="div" size='normal'>Count</Text>
          </div>
        ),
      },
      {
        ...trackGrid.total,
        node: !isMobile && (
          <div className={s.total}>
            <Text element="div" size='normal'>Total</Text>
          </div>
        ),
      },
      {
        ...trackGrid.options,
        node: !isMobile && <div aria-label="option-menu" />,
      },
    ];

  return <GridRowWrapper columns={columns} className={s.header} />;
}
