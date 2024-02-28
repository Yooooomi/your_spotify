import { useState, useEffect } from "react";
import { api } from "../apis/api";
import { Album, Artist } from "../types";

export function useLoadArtists(ids: string[]) {
  const [artists, setArtists] = useState<Record<string, Artist>>({});

  const loaded = ids.length === 0 || ids.every(id => id in artists);

  useEffect(() => {
    async function fetchArtists() {
      if (!loaded && ids.length > 0) {
        try {
          const { data } = await api.getArtists(ids);
          setArtists(
            data.reduce<Record<string, Artist>>((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchArtists();
  }, [artists, ids, loaded]);

  return { artists, loaded };
}

export function useLoadAlbums(ids: string[]) {
  const [albums, setAlbums] = useState<Record<string, Album>>({});

  const loaded = ids.length === 0 || ids.every(id => id in albums);

  useEffect(() => {
    async function fetchAlbums() {
      if (!loaded && ids.length > 0) {
        try {
          const { data } = await api.getAlbums(ids);
          setAlbums(
            data.reduce<Record<string, Album>>((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchAlbums();
  }, [albums, ids, loaded]);

  return { albums, loaded };
}
