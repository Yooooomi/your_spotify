import { useDispatch } from "react-redux";
import ThreePoints from "../../../components/ThreePoints";
import { setPlaylistContext } from "../../../services/redux/modules/playlist/reducer";

interface MostListenedTracksContextMenuButtonProps {
  artistId: string;
}

export function MostListenedTracksContextMenuButton({ artistId }: MostListenedTracksContextMenuButtonProps) {
  const dispatch = useDispatch()

  function handleCreatePlaylist() {
    dispatch(setPlaylistContext({ type: "top-artist", nb: 10, artistId }))
  }

  return <ThreePoints items={[{
    label: "Create playlist", onClick: handleCreatePlaylist,
  }]} />
}