import { useMobile } from "../../services/hooks/hooks";
import { setPlaylistContext } from "../../services/redux/modules/playlist/reducer";
import { playTrack } from "../../services/redux/modules/user/thunk";
import { useAppDispatch } from "../../services/redux/tools";
import { Track } from "../../services/types";
import { MenuItem } from "../MenuItem/MenuItem";

interface TrackOptionsContentProps {
  onClose: () => void;
  track: Track;
}

export default function TrackOptionsContent({
  onClose,
  track,
}: TrackOptionsContentProps) {
  const dispatch = useAppDispatch();
  const [isMobile] = useMobile();

  const add = () => {
    onClose();
    dispatch(
      setPlaylistContext({
        type: "specific",
        songIds: [track.id],
      }),
    );
  };

  const play = () => {
    dispatch(playTrack(track.id)).catch(console.error);
  };

  return (
    <>
      {isMobile && <MenuItem onClick={play}>Play</MenuItem>}
      <MenuItem onClick={add}>Add to playlist</MenuItem>
    </>
  );
}
