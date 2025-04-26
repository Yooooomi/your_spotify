import { YourSpotifyError } from "./error";

class DatabaseError extends YourSpotifyError {}

export class NoResult extends DatabaseError {
  constructor() {
    super("No result found");
  }
}
