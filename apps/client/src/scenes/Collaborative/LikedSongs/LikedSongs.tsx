import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import Text from "../../../components/Text";
import s from "./index.module.css";
import { Button } from "@mui/material";
import { useAppDispatch } from "../../../services/redux/tools";
import { syncLikedSongsStatus, setSyncLikedSongs } from "../../../services/redux/modules/user/thunk";
import { alertMessage } from "../../../services/redux/modules/message/reducer";
import { selectUser } from "../../../services/redux/modules/user/selector";
import { useSelector } from "react-redux";
import { SyncLikedSongsStatusResponse, SyncLikedSongsResponse } from "../../../services/redux/modules/user/types";

export default function LikedSongs() {
    const user = useSelector(selectUser);
    const [likedSongsPlaylistId, setLikedSongsPlaylistId] = useState<string>("");
    const [syncEnabled, setSyncEnabled] = useState<boolean>(false);
    const [likedSongsLoading, setLoadingLikedSongs] = useState<boolean>(true);
    const [showPlaylistEmbed, setShowPlaylistEmbed] = useState<boolean>(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const dispatch = useAppDispatch();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    if (!user) {
        return null;
    }

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                let enabled = user.syncLikedSongsStatus == "active" || user.syncLikedSongsStatus == "loading";
                setSyncEnabled(enabled);
                setShowPlaylistEmbed(enabled);
                if (user.syncLikedSongsPlaylistId) {
                    setLikedSongsPlaylistId(user.syncLikedSongsPlaylistId);
                }
            } catch (error) {
                console.error("Failed to fetch initial state:", error);
                showRequestError();
            } finally {
                setLoadingLikedSongs(false);
            }
        };

        fetchInitialState();
    }, [user]);

    const startRecursiveCheck = async (playlistId: string, count = 0) => {
        if (count < 20) {
            let result = (await dispatch(syncLikedSongsStatus())).payload as SyncLikedSongsStatusResponse;
            if (result.success && result.status == "active") {
                dispatch(alertMessage({
                    level: "success",
                    message: "Sync complete",
                }));
                return;
            } else if (result.status == "failed") {
                dispatch(alertMessage({
                    level: "error",
                    message: "Sync failed. Please try again later",
                }));
                return;
            }

            if (iframeRef.current) {
                iframeRef.current.src = `https://open.spotify.com/embed/playlist/${playlistId}?cache=${new Date().getTime()}`;
                const id = setTimeout(() => startRecursiveCheck(playlistId, count + 1), 3000);
                setTimeoutId(id);
            }
        } else {
            setTimeoutId(null);
        }
    };

    const stopRecursiveCheck = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
    };

    const toggleSync = async () => {
        if (likedSongsLoading) return;

        setLoadingLikedSongs(true);
        const newSyncEnabled = !syncEnabled;

        try {
            let result = (await dispatch(setSyncLikedSongs(newSyncEnabled))).payload as SyncLikedSongsResponse;
            if (result.success) {
                setSyncEnabled(newSyncEnabled);
                setShowPlaylistEmbed(newSyncEnabled);

                if (newSyncEnabled) {
                    setTimeout(()=> {
                        setLikedSongsPlaylistId(result.playlistId);
                        startRecursiveCheck(result.playlistId);
                    }, 1000);
                } else {
                    setLikedSongsPlaylistId("");
                    stopRecursiveCheck();
                }
            }
            else {
                showRequestError("Failed to update sync status");
            }
        } catch (error) {
            console.error("Failed to update syncLikedSongs state:", error);
            showRequestError();
        } finally {
            setLoadingLikedSongs(false);
        }
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
                <div className={s.buttonContainer}>
                    <Text>Sync your liked songs:</Text>
                    <Button
                        className={s.syncButton}
                        variant="contained"
                        onClick={toggleSync}
                        disabled={likedSongsLoading} // Disable button while setLikedSongsLoading
                    >
                        {syncEnabled ? "On" : "Off"}
                    </Button>
                </div>
                <br></br>
                {showPlaylistEmbed && (
                    <div className={s.embedContainer}>
                        <Text>Preview (press to open)</Text>
                        <iframe
                            ref={iframeRef}
                            className={s.embedPlaylist}
                            src={`https://open.spotify.com/embed/playlist/${likedSongsPlaylistId}?cache=${new Date().getTime()}`}
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}