import { Button } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";

import {
  selectIsPublic,
  selectUser,
} from "../../services/redux/modules/user/selector";
import { getSpotifyLogUrl } from "../../services/tools";
import Dialog from "../Dialog";
import SimpleDialogContent from "../SimpleDialogContent";

// Spotify expires authorizations after six months, so prompting at one month
// leaves five months of margin for the user to open the dashboard.
const PROPOSE_REFRESH_AFTER_DAYS = 30;
const DISMISSED_KEY = "spotify-auth-refresh-dismissed";

export default function SpotifyAuthRefreshDialog() {
  const user = useSelector(selectUser);
  const isPublic = useSelector(selectIsPublic);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === "true",
  );

  if (!user || user.isGuest || isPublic || dismissed) {
    return null;
  }

  // Set by the server when Spotify rejected a refresh and the tokens were
  // discarded.
  const tokenDiscarded = Boolean(user.spotifyReauthRequired);

  // Accounts that authorized before this field existed have no date, they only
  // get prompted once their tokens are actually discarded.
  const authAgeDays = user.spotifyAuthDate
    ? Math.floor(
        (Date.now() - new Date(user.spotifyAuthDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : undefined;
  if (
    !tokenDiscarded &&
    (authAgeDays === undefined || authAgeDays < PROPOSE_REFRESH_AFTER_DAYS)
  ) {
    return null;
  }

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <Dialog
      open
      maxWidth="sm"
      title="Refresh your Spotify authorization"
      onClose={dismiss}>
      <SimpleDialogContent
        message={
          tokenDiscarded
            ? "Your Spotify authorization has expired or was revoked, and the tracking of your listening history has stopped. Refresh it to resume tracking."
            : `You authorized Spotify ${authAgeDays} days ago. Spotify expires authorizations six months after sign-in, which would interrupt the tracking of your listening history. Refreshing it now only takes a second.`
        }
        actions={
          <>
            <Button onClick={dismiss}>Remind me later</Button>
            <Button variant="contained" href={getSpotifyLogUrl()}>
              Refresh authorization
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
