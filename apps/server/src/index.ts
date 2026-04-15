import { startServer } from "./bin/www";
import { runMergeTracksByIsrcCli } from "./migrations/mergeTracksByIsrc";
import { runMigrations } from "./migrations";

if (process.argv[2] === "--migrate") {
  runMigrations();
} else if (process.argv[2] === "--merge-tracks-by-isrc") {
  void runMergeTracksByIsrcCli(process.argv.slice(3));
} else {
  startServer();
}
