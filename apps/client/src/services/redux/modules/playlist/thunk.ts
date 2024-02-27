import { api } from "../../../apis/api";
import { myAsyncThunk } from "../../tools";
import { Playlist, PlaylistContext } from "./types";

export const fetchPlaylists = myAsyncThunk<Playlist[] | null, void>(
  "@playlist/fetch",
  async () => {
    try {
      const { data } = await api.getPlaylists();
      return data;
    } catch (e) {
      console.error(e);
    }
    return null;
  },
);

type AddToPlaylistPayload =
  | { id: string; context: PlaylistContext }
  | { id: undefined; name: string; context: PlaylistContext };

export const addToPlaylist = myAsyncThunk<void, AddToPlaylistPayload>(
  "@playlist/add",
  async (payload, tapi) => {
    try {
      await api.addToPlaylist(
        payload.id,
        "name" in payload ? payload.name : undefined,
        payload.context,
      );
      tapi.dispatch(fetchPlaylists());
    } catch (e) {
      console.error(e);
    }
  },
);
