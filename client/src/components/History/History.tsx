import { CircularProgress } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { api } from "../../services/api";
import { TrackInfoWithTrack } from "../../services/types";
import TitleCard from "../TitleCard";
import Track from "./Track";

export default function History() {
  const [items, setItems] = useState<TrackInfoWithTrack[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async () => {
    if (!hasMore) return;
    const result = await api.getTracks(10, items.length);
    setItems([...items, ...result.data]);
    setHasMore(result.data.length === 10);
  }, [hasMore, items]);

  useEffect(() => {
    fetch();
    // initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TitleCard title="Your history">
      <Track line playable />
      <InfiniteScroll
        dataLength={items.length}
        next={fetch}
        hasMore={hasMore}
        loader={<CircularProgress />}
      >
        {items.map((item) => (
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
