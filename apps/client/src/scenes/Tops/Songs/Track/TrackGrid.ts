import { commonUnits } from "../../../../components/Grid/commonUnits";
import { useMobile } from "../../../../services/hooks/hooks";

export function useTrackGrid() {
  const [isMobile] = useMobile();

  return ({
    rank: { unit: commonUnits.rank, key: "rank" },
    cover: { unit: commonUnits.cover, key: "cover" },
    title: { unit: commonUnits.mainTitle, key: "title" },
    album: { unit: commonUnits.secondaryTitle, key: "album" },
    duration: { unit: commonUnits.duration, key: "duration" },
    count: { unit: commonUnits.percentage(isMobile), key: "count" },
    total: { unit: commonUnits.percentage(isMobile), key: "total" },
    options: { unit: commonUnits.options, key: "options" },
  }) as const;
}
