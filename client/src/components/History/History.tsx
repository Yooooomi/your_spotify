import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Checkbox } from '@mui/material';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { api, ApiData, DEFAULT_ITEMS_TO_LOAD } from '../../services/apis/api';
import { TrackInfoWithTrack } from '../../services/types';
import Loader from '../Loader';
import TitleCard from '../TitleCard';
import Track from './Track';
import s from './index.module.css';
import Text from '../Text';
import { selectRawIntervalDetail } from '../../services/redux/modules/user/selector';

export default function History() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const [items, setItems] = useState<TrackInfoWithTrack[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [followInterval, setFollowInterval] = useState(true);
  const ref = useRef<(force?: boolean) => void>();

  ref.current = async (force = false) => {
    if (!hasMore && !force) return;
    let result: ApiData<'getTracks'>;
    if (followInterval) {
      ({ data: result } = await api.getTracks(
        DEFAULT_ITEMS_TO_LOAD,
        items.length,
        interval.start,
        interval.end,
      ));
    } else {
      ({ data: result } = await api.getTracks(
        DEFAULT_ITEMS_TO_LOAD,
        items.length,
      ));
    }
    setItems([...items, ...result]);
    setHasMore(result.length === DEFAULT_ITEMS_TO_LOAD);
  };

  useEffect(() => {
    setHasMore(false);
    setItems([]);
    setTimeout(() => ref.current?.(true), 0);
  }, [interval, followInterval]);

  const handleSetFollowInterval = useCallback(
    (ev: React.SyntheticEvent, value: boolean) => {
      setFollowInterval(value);
    },
    [],
  );

  return (
    <TitleCard
      title="Your history"
      right={
        <div className={s.followinterval}>
          <Checkbox
            checked={followInterval}
            onChange={handleSetFollowInterval}
          />
          <Text>Follow interval</Text>
        </div>
      }>
      <Track line playable />
      <InfiniteScroll
        dataLength={items.length}
        next={ref.current}
        hasMore={hasMore}
        loader={<Loader />}>
        {items.map(item => (
          <Track
            playable
            key={item.played_at}
            listenedAt={new Date(item.played_at)}
            artists={item.track.full_artist}
            album={item.track.full_album}
            track={item.track}
          />
        ))}
      </InfiniteScroll>
    </TitleCard>
  );
}
