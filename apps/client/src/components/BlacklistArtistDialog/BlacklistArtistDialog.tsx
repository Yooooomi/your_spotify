import { Dialog, DialogContent, Button } from "@mui/material";
import { useCallback } from "react";
import {
  blacklistArtist,
  unblacklistArtist,
} from "../../services/redux/modules/user/thunk";
import { useAppDispatch } from "../../services/redux/tools";
import SimpleDialogContent from "../SimpleDialogContent";

interface BlacklistArtistDialogProps {
  artistId?: string;
  artistName?: string;
  blacklisted: boolean;
  onClose?: () => void;
}

export default function BlacklistArtistDialog({
  artistId,
  artistName,
  blacklisted,
  onClose,
}: BlacklistArtistDialogProps) {
  const dispatch = useAppDispatch();

  const doBlacklist = useCallback(async () => {
    if (!artistId) {
      return;
    }
    await dispatch(blacklistArtist(artistId));
    onClose?.();
  }, [artistId, dispatch, onClose]);

  const doUnblacklist = useCallback(async () => {
    if (!artistId) {
      return undefined;
    }
    await dispatch(unblacklistArtist(artistId));
    onClose?.();
  }, [dispatch, artistId, onClose]);

  return (
    <>
      <Dialog
        title={`Do you really want to blacklist ${artistName}`}
        open={Boolean(artistId) && !blacklisted}
        onClose={onClose}>
        <DialogContent>
          <SimpleDialogContent
            message="Doing this will hide this artist from every computed statistics and song history."
            actions={
              <Button variant="contained" color="error" onClick={doBlacklist}>
                I understand, blacklist {artistName}
              </Button>
            }
          />
        </DialogContent>
      </Dialog>
      <Dialog
        title={`Do you really want to unblacklist ${artistName}`}
        open={Boolean(artistId) && blacklisted}
        onClose={onClose}>
        <DialogContent>
          <SimpleDialogContent
            message="Unblacklisting will result in having the artist back in the computed statistics and song history."
            actions={
              <Button variant="contained" color="error" onClick={doUnblacklist}>
                I understand, unblacklist {artistName}
              </Button>
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
