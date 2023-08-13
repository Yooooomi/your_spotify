import { useMemo } from 'react';
import { commonUnits } from '../../../../components/Grid/commonUnits';
import { useMobile } from '../../../../services/hooks/hooks';

export function useGenreGrid() {
  const [isMobile] = useMobile();

  return useMemo(
    () =>
      ({
        cover: { unit: commonUnits.cover, key: 'cover' },
        title: { unit: commonUnits.mainTitle, key: 'title' },
        artists: { unit: '2fr', key: 'artists' },
        count: { unit: commonUnits.percentage(isMobile), key: 'count' },
        total: { unit: commonUnits.percentage(isMobile), key: 'total' },
      }) as const,
    [isMobile],
  );
}
