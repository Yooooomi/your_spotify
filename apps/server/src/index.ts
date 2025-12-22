import { startServer } from "./bin/www";
import { runMigrations } from "./migrations";

if (process.argv[2] === "--migrate") {
  runMigrations();
} else {
  startServer();
}
