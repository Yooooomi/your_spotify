import React, { useMemo } from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';

function SongsListened({ total }) {
  const top = useMemo(() => 'Songs listened', []);

  const value = useMemo(() => (
    <div>
      {total.count}
    </div>
  ), [total]);

  return (
    <BasicCard
      top={top}
      value={value}
    />
  );
}

export default SongsListened;
