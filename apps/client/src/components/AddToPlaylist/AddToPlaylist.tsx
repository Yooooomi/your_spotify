import { Button } from "@mui/material";
import { useCallback } from "react";
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

  const add = useCallback(() => {
    dispatch(setPlaylistContext(context));
  }, [context, dispatch]);

  if (isGuest) {
    return null;
  }

  return <Button onClick={add}>Create playlist</Button>;
}
