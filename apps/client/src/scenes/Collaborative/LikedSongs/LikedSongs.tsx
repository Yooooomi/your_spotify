import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import Text from "../../../components/Text";
import s from "./index.module.css";
import { Button } from "@mui/material";
import { useAppDispatch } from "../../../services/redux/tools";
import { setSyncLikedSongs } from "../../../services/redux/modules/user/thunk";
import { alertMessage } from "../../../services/redux/modules/message/reducer";
import { selectUser } from "../../../services/redux/modules/user/selector";
import { useSelector } from "react-redux";
import { SyncLikedSongsResponse } from "../../../services/redux/modules/user/types";
import { useAPI } from "../../../services/hooks/hooks";
import { api } from "../../../services/apis/api";

export default function LikedSongs() {
    const user = useSelector(selectUser);
    const [likedSongsPlaylistId, setLikedSongsPlaylistId] = useState<string>("");
    const [syncEnabled, setSyncEnabled] = useState<boolean>(false);
    const [likedSongsLoading, setLoadingLikedSongs] = useState<boolean>(true);
    const [playlistsLoading, setLoadingPlaylist] = useState<boolean>(true);
    const [showPlaylistButton, setShowPlaylistButton] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const playlists = useAPI(api.getPlaylists)

    if (!user) {
        return null;
    }

    useEffect(() => {
        const fetchInitialState = async () => {
            setLoadingLikedSongs(true);
            try {
                setSyncEnabled(user.syncLikedSongs);
                setShowPlaylistButton(user.syncLikedSongs);

                if (playlists != null) {
                    let result = await playlists.find((playlist: any) => playlist.name === "Liked songs • " + user.username)?.id;
                    if (result != undefined) {
                        setLikedSongsPlaylistId(result);
                    }
                }
                setLoadingPlaylist(false);
            } catch (error) {
                console.error("Failed to fetch initial state:", error);
                showRequestError();
            } finally {
                setLoadingLikedSongs(false);
            }
        };

        fetchInitialState();
    }, [user, playlists]);

    const toggleSync = async () => {
        if (likedSongsLoading) return;

        setLoadingLikedSongs(true);
        const newSyncEnabled = !syncEnabled;

        try {
            let result = (await dispatch(setSyncLikedSongs(newSyncEnabled))).payload as SyncLikedSongsResponse;
            if (result.success) {
                setSyncEnabled(newSyncEnabled);
                setShowPlaylistButton(newSyncEnabled);

                if (newSyncEnabled) {
                    setLikedSongsPlaylistId(result.playlistId);
                } else {
                    setLikedSongsPlaylistId("");
                }
            }
        } catch (error) {
            console.error("Failed to update syncLikedSongs state:", error);
            showRequestError();
        } finally {
            setLoadingLikedSongs(false);
        }
    };

    const openPlaylist = async () => {
        if (likedSongsPlaylistId === "") {
            if (playlists != null) {
                if (playlists.length == 0) {
                    showRequestError("No playlists found");
                }
            } else {
                showRequestError();
            }
            return;
        }

        const url = `https://open.spotify.com/playlist/${likedSongsPlaylistId}`;
        window.open(url, "_blank");
    };

    const showRequestError = (msg: string = "The web application could not communicate with the server") => {
        dispatch(alertMessage({
            level: "error",
            message: msg,
        }));
    }

    return (
        <div className={s.root}>
            <Header
                hideInterval
                title={<div className={s.title}>Share liked songs</div>}
                subtitle="Automatically syncs your liked songs into a shareable playlist every night"
            />
            <div className={s.content}>
                <Text>Sync your liked songs:</Text>
                <Button
                    className={s.syncButton}
                    variant="contained"
                    onClick={toggleSync}
                    disabled={likedSongsLoading} // Disable button while setLikedSongsLoading
                >
                    {syncEnabled ? "On" : "Off"}
                </Button>
                <br></br>
                {showPlaylistButton && (
                    <Button
                        className={s.playlistButton}
                        variant="contained"
                        onClick={openPlaylist}
                        disabled={playlistsLoading}
                    >
                        Open playlist
                    </Button>
                )}
            </div>
        </div>
    );
}