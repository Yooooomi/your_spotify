import { useState } from "react";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { api } from "../../services/apis/api";
import Loader from "../Loader";
import TitleCard from "../TitleCard";
import {
  selectRawAllInterval,
  selectRawIntervalDetail,
} from "../../services/redux/modules/user/selector";
import { GridWrapper } from "../Grid";
import { useInfiniteScroll } from "../../services/hooks/scrolling";
import CheckboxWithText from "../CheckboxWithText";
import {
  Selectable,
  SelectableContextProvider,
} from "../Selectable/Selectable.context";
import {
  RightClickable,
} from "../RightClickable/RightClickable";
import { useSelectTracks } from "../../services/hooks/useSelectTrack";
import TrackHeader from "./Track/TrackHeader";
import Track from "./Track";
import { TrackSelectionPopup } from "./Track/TrackSelectionPopup";

export default function History() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const { interval: allInterval } = useSelector(selectRawAllInterval);
  const [followInterval, setFollowInterval] = useState(true);
  const { items, hasMore, onNext } = useInfiniteScroll(
    followInterval ? interval : allInterval,
    api.getTracks,
  );

  const handleSetFollowInterval = (value: boolean) => {
    setFollowInterval(value);
  };

  const { anchor, selectedTracks, setAnchor, setSelectedTracks, uniqSongIds } =
    useSelectTracks({ tracks: items });

  return (
    <>
      <TitleCard
        title="Your history"
        info="You can select tracks by clicking them, ctrl-clicking them to add to the selection. You can also use shift-click to expand your selection"
        right={
          <CheckboxWithText
            checked={followInterval}
            onChecked={handleSetFollowInterval}
            text="Follow interval"
          />
        }>
        <SelectableContextProvider
          selected={selectedTracks}
          setSelected={setSelectedTracks}>
          <InfiniteScroll
            dataLength={items.length}
            next={onNext}
            hasMore={hasMore}
            loader={<Loader />}>
            <GridWrapper>
              <TrackHeader />
              {items.map((item, index) => (
                <Selectable key={item.played_at} index={index}>
                  <RightClickable index={index} onRightClick={setAnchor}>
                    <Track
                      listenedAt={new Date(item.played_at)}
                      artists={item.track.full_artists}
                      album={item.track.full_album}
                      track={item.track}
                    />
                  </RightClickable>
                </Selectable>
              ))}
            </GridWrapper>
          </InfiniteScroll>
        </SelectableContextProvider>
      </TitleCard>
      <TrackSelectionPopup
        anchor={anchor}
        onClose={() => setAnchor(undefined)}
        songIds={uniqSongIds}
      />
    </>
  );
}
