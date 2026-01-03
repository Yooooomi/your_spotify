import { Button } from "@mui/material";
import { useIsGuest } from "../../services/hooks/hooks";
import { setPlaylistContext } from "../../services/redux/modules/playlist/reducer";
import { PlaylistContext } from "../../services/redux/modules/playlist/types";
import { useAppDispatch } from "../../services/redux/tools";

interface AddToPlaylistProps {
  context: PlaylistContext;
}

export default function AddToPlaylist({ context }: AddToPlaylistProps) {
  const dispatch = useAppDispatch();
  const isGuest = useIsGuest();

  const add = () => {
    dispatch(setPlaylistContext(context));
  };

  if (isGuest) {
    return null;
  }

  return <Button onClick={add}>Create playlist</Button>;
}
