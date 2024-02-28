import { useMemo } from "react";
import { commonUnits } from "../../../../components/Grid/commonUnits";
import { useMobile } from "../../../../services/hooks/hooks";

export function useArtistGrid() {
  const [isMobile] = useMobile();

  return useMemo(
    () =>
      ({
        cover: { unit: commonUnits.cover, key: "cover" },
        title: { unit: commonUnits.mainTitle, key: "title" },
        genres: { unit: "2fr", key: "genres" },
        count: { unit: commonUnits.percentage(isMobile), key: "count" },
        total: { unit: commonUnits.percentage(isMobile), key: "total" },
      }) as const,
    [isMobile],
  );
}
