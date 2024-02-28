import { useState, useEffect } from "react";
import { api } from "./apis/api";
import { Track } from "./types";

export function useTracks(ids: string[]) {
  const [tracks, setTracks] = useState<Record<string, Track>>({});
  const loaded = ids.length === 0 || ids.every(id => id in tracks);

  useEffect(() => {
    async function fetchTracks() {
      if (!ids.every(id => id in tracks)) {
        try {
          const { data } = await api.getTrackDetails(ids);
          setTracks(
            data.reduce<Record<string, Track>>((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchTracks();
  }, [tracks, ids]);

  return { loaded, tracks };
}
