import { YourSpotifyError } from "./error";

// Keeps the default UNKNOWN type: the YourSpotify session is still valid, only
// the Spotify authorization is gone, and a 401 would log the user out.
export class SpotifyReauthRequiredError extends YourSpotifyError {
  constructor(username: string) {
    super(
      `Spotify authorization of ${username} is no longer valid, the user has to re-log to Spotify`,
    );
  }
}
