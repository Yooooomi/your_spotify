import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox } from '@mui/material';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { api } from '../../services/api';
import { TrackInfoWithTrack, UnboxPromise } from '../../services/types';
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

  const fetch = useCallback(async () => {
    if (!hasMore) return;
    let result: UnboxPromise<ReturnType<typeof api.getTracks>>;
    if (followInterval) {
      result = await api.getTracks(
        10,
        items.length,
        interval.start,
        interval.end,
      );
    } else {
      result = await api.getTracks(10, items.length);
    }
    setItems([...items, ...result.data]);
    setHasMore(result.data.length === 10);
  }, [hasMore, followInterval, items, interval.start, interval.end]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    fetch();
  }, [fetch]);

  const handleSetFollowInterval = useCallback(
    (ev: React.SyntheticEvent, value: boolean) => {
      setFollowInterval(value);
      reset();
    },
    [reset],
  );

  useEffect(() => {
    reset();
    // initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  useEffect(() => {
    fetch();
    // initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        next={fetch}
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
