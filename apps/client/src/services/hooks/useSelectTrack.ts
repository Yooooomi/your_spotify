import { useState } from "react";
import { VirtualElement } from "../../components/RightClickable/RightClickable";
import { compact } from "../tools";

interface UseSelectTracksProps {
  tracks: Array<{ id: string }>;
}

export function useSelectTracks({ tracks }: UseSelectTracksProps) {
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [anchor, setAnchor] = useState<VirtualElement | undefined>();

  const uniqSongIds = compact(selectedTracks.map(index => tracks[index]?.id));

  return { anchor, setAnchor, selectedTracks, setSelectedTracks, uniqSongIds };
}
