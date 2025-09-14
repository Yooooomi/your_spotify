import { Popover } from "@mui/material";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { VirtualElement } from "../../RightClickable/RightClickable";
import { setPlaylistContext } from "../../../services/redux/modules/playlist/reducer";
import { MenuItem } from "../../MenuItem/MenuItem";
import { MenuTitle } from "../../MenuTitle/MenuTitle";

interface TrackSelectionPopupProps {
  anchor: VirtualElement | undefined;
  onClose: () => void;
  songIds: string[];
}

export function TrackSelectionPopup({
  anchor,
  onClose,
  songIds,
}: TrackSelectionPopupProps) {
  const dispatch = useDispatch();

  const handlePlaylist = useCallback(() => {
    onClose();
    dispatch(
      setPlaylistContext({
        type: "specific",
        songIds,
      }),
    );
  }, [dispatch, onClose, songIds]);

  return (
    <Popover
      open={Boolean(anchor)}
      onClose={onClose}
      anchorEl={anchor ? { ...anchor, nodeType: 1 } : undefined}
      // PaperProps={{ className: s.root }}
      transformOrigin={{ horizontal: "left", vertical: "top" }}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
      <MenuTitle>{songIds.length} songs selected</MenuTitle>
      <MenuItem onClick={handlePlaylist}>Add to playlist</MenuItem>
    </Popover>
  );
}
