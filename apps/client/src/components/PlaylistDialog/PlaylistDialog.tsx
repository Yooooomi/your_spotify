import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  clearPlaylistContext,
  setPlaylistContext,
} from "../../services/redux/modules/playlist/reducer";
import {
  selectPlaylistContext,
  selectPlaylists,
} from "../../services/redux/modules/playlist/selector";
import {
  addToPlaylist,
  fetchPlaylists,
} from "../../services/redux/modules/playlist/thunk";
import { useAppDispatch } from "../../services/redux/tools";
import Dialog from "../Dialog";
import IdealImage from "../IdealImage";
import LoadingButton from "../LoadingButton";
import TabPanel from "../TabPanel";
import Text from "../Text";
import CountChooser from "./CountChooser";
import s from "./index.module.css";

export const DEFAULT_PLAYLIST_NB = 50;

export default function PlaylistDialog() {
  const dispatch = useAppDispatch();
  const playlists = useSelector(selectPlaylists);
  const context = useSelector(selectPlaylistContext);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [requested, setRequested] = useState(false);

  const changeNumber = (newNb: number) => {
    if (!context || (context.type !== "top" && context.type !== "affinity" && context.type !== "top-artist")) {
      return;
    }
    dispatch(
      setPlaylistContext({
        ...context,
        nb: newNb,
      }),
    );
  };

  const reset = () => {
    dispatch(clearPlaylistContext());
    setPlaylistName("");
    setSelectedPlaylist("");
    setTab(0);
    setLoading(false);
  };

  const open = !!context;

  useEffect(() => {
    if (open && !playlists && !requested) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRequested(true);
      dispatch(fetchPlaylists()).catch(console.error);
    }
  }, [dispatch, open, playlists, requested]);

  const canAdd =
    (tab === 0 && !!playlistName) || (tab === 1 && !!selectedPlaylist);

  const add = async () => {
    if (!context || !canAdd) {
      return;
    }
    setLoading(true);
    await dispatch(
      addToPlaylist({
        id: tab === 1 ? selectedPlaylist : undefined,
        name: playlistName,
        context,
      }),
    );
    reset();
  };

  return (
    <Dialog onClose={reset} open={open} title="Add to a playlist">
      <Text className={s.text} element="div" size='normal'>
        Either select a playlist to add the songs to, or create a new one.
      </Text>
      <Box borderBottom={1} borderColor="divider" className={s.tabs}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Create" />
          <Tab label="Add to existing" />
        </Tabs>
      </Box>
      <TabPanel index={0} value={tab}>
        <Input
          fullWidth
          placeholder="Name of the playlist..."
          value={playlistName}
          onChange={ev => setPlaylistName(ev.target.value)}
        />
      </TabPanel>
      <TabPanel index={1} value={tab}>
        <FormControl fullWidth>
          <InputLabel id="playlist">Select a playlist</InputLabel>
          <Select
            classes={{ select: s.playlistItem }}
            labelId="playlist"
            label="Select a playlist"
            value={selectedPlaylist}
            onChange={ev => setSelectedPlaylist(ev.target.value)}>
            {playlists?.map(playlist => (
              <MenuItem key={playlist.id} value={playlist.id}>
                <IdealImage
                  alt="playlist cover"
                  className={s.playlistCover}
                  images={playlist.images}
                  size={50}
                />
                {playlist.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TabPanel>
      {(context?.type === "top" || context?.type === "affinity" || context?.type === "top-artist") && (
        <CountChooser value={context.nb} setValue={changeNumber} />
      )}
      <div className={s.button}>
        <LoadingButton
          loading={loading}
          variant="contained"
          onClick={add}
          disabled={!canAdd}>
          {selectedPlaylist ? "Add" : "Create"}
        </LoadingButton>
      </div>
    </Dialog>
  );
}
