import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import AddToPlaylist from "../../../components/AddToPlaylist";
import { GridWrapper } from "../../../components/Grid";
import Header from "../../../components/Header";
import Loader from "../../../components/Loader";
import { DEFAULT_PLAYLIST_NB } from "../../../components/PlaylistDialog/PlaylistDialog";
import TitleCard from "../../../components/TitleCard";
import { api } from "../../../services/apis/api";
import { PlaylistContext } from "../../../services/redux/modules/playlist/types";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import { useInfiniteScroll } from "../../../services/hooks/scrolling";
import Track from "./Track";
import TrackHeader from "./Track/TrackHeader";
import s from "./index.module.css";

export default function Songs() {
  const { interval } = useSelector(selectRawIntervalDetail);

  const { items, hasMore, onNext } = useInfiniteScroll(
    interval,
    api.getBestSongs,
  );

  const context = useMemo<PlaylistContext>(
    () => ({
      type: "top",
      nb: DEFAULT_PLAYLIST_NB,
      interval: {
        start: interval.start.getTime(),
        end: interval.end.getTime(),
      },
    }),
    [interval.end, interval.start],
  );

  return (
    <div>
      <Header
        title="Top songs"
        subtitle="Here are the songs you listened to the most"
      />
      <div className={s.content}>
        <TitleCard
          noBorder
          title="Top songs"
          right={<AddToPlaylist context={context} />}>
          <InfiniteScroll
            next={onNext}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<Loader />}>
            <GridWrapper>
              <TrackHeader />
              {items.map(item => (
                <Track
                  playable
                  key={item.track.id}
                  track={item.track}
                  album={item.album}
                  artists={[item.artist]}
                  count={item.count}
                  totalCount={item.total_count}
                  duration={item.duration_ms}
                  totalDuration={item.total_duration_ms}
                />
              ))}
            </GridWrapper>
          </InfiniteScroll>
        </TitleCard>
      </div>
    </div>
  );
}
