import { useState, useMemo } from "react";
import { VirtualElement } from "../../components/RightClickable/RightClickable";
import { compact } from "../tools";
import { Track } from "../types";

interface UseSelectTracksProps {
  tracks: Array<{ id: string }>;
}

export function useSelectTracks({ tracks }: UseSelectTracksProps) {
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [anchor, setAnchor] = useState<VirtualElement | undefined>();

  const uniqSongIds = useMemo(
    () => compact(selectedTracks.map(index => tracks[index]?.id)),
    [selectedTracks, tracks],
  );

  return { anchor, setAnchor, selectedTracks, setSelectedTracks, uniqSongIds };
}
