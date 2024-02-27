import { MenuItem } from "@mui/material";
import { useCallback } from "react";
import { useMobile } from "../../services/hooks/hooks";
import { setPlaylistContext } from "../../services/redux/modules/playlist/reducer";
import { playTrack } from "../../services/redux/modules/user/thunk";
import { useAppDispatch } from "../../services/redux/tools";
import { Track } from "../../services/types";
import s from "./index.module.css";

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

  const add = useCallback(() => {
    onClose();
    dispatch(
      setPlaylistContext({
        type: "single",
        songId: track.id,
      }),
    );
  }, [dispatch, onClose, track.id]);

  const play = useCallback(() => {
    dispatch(playTrack(track.id));
  }, [dispatch, track.id]);

  return (
    <>
      {isMobile && (
        <MenuItem className={s.item} onClick={play}>
          Play
        </MenuItem>
      )}
      <MenuItem className={s.item} onClick={add}>
        Add to playlist
      </MenuItem>
    </>
  );
}
