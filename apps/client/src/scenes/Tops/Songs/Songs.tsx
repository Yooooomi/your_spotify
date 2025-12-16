import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import AddToPlaylist from "../../../components/AddToPlaylist";
import { GridWrapper } from "../../../components/Grid";
import Header from "../../../components/Header";
import Loader from "../../../components/Loader";
import { DEFAULT_PLAYLIST_NB } from "../../../components/PlaylistDialog/PlaylistDialog";
import TitleCard from "../../../components/TitleCard";
import { api } from "../../../services/apis/api";
import { selectRawIntervalDetail } from "../../../services/redux/modules/user/selector";
import { useInfiniteScroll } from "../../../services/hooks/scrolling";
import { useSelectTracks } from "../../../services/hooks/useSelectTrack";
import {
  Selectable,
  SelectableContextProvider,
} from "../../../components/Selectable/Selectable.context";
import { RightClickable } from "../../../components/RightClickable/RightClickable";
import { TrackSelectionPopup } from "../../../components/History/Track/TrackSelectionPopup";
import Track from "./Track";
import TrackHeader from "./Track/TrackHeader";
import s from "./index.module.css";

export default function Songs() {
  const { interval } = useSelector(selectRawIntervalDetail);

  const { items, hasMore, onNext } = useInfiniteScroll(
    interval,
    api.getBestSongs,
  );

  const context = {
    type: "top",
    nb: DEFAULT_PLAYLIST_NB,
    interval: {
      start: interval.start.getTime(),
      end: interval.end.getTime(),
    },
  };

  const { anchor, selectedTracks, setAnchor, setSelectedTracks, uniqSongIds } =
    useSelectTracks({ tracks: items.map(item => item.track) });

  return (
    <>
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
            <SelectableContextProvider
              selected={selectedTracks}
              setSelected={setSelectedTracks}>
              <InfiniteScroll
                next={onNext}
                hasMore={hasMore}
                dataLength={items.length}
                loader={<Loader />}>
                <GridWrapper>
                  <TrackHeader />
                  {items.map((item, index) => (
                    <Selectable key={item.track.id} index={index}>
                      <RightClickable index={index} onRightClick={setAnchor}>
                        <Track
                          playable
                          rank={index + 1}
                          track={item.track}
                          album={item.album}
                          artists={[item.artist]}
                          count={item.count}
                          totalCount={item.total_count}
                          duration={item.duration_ms}
                          totalDuration={item.total_duration_ms}
                        />
                      </RightClickable>
                    </Selectable>
                  ))}
                </GridWrapper>
              </InfiniteScroll>
            </SelectableContextProvider>
          </TitleCard>
        </div>
      </div>
      <TrackSelectionPopup
        anchor={anchor}
        onClose={() => setAnchor(undefined)}
        songIds={uniqSongIds}
      />
    </>
  );
}
