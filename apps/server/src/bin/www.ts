import http from "http";

import { app } from "../app";
import { checkBlacklistConsistency, connect } from "../database";
import { fixRunningImportsAtStart } from "../database/queries/importer";
import { dbLoop } from "../spotify/looper";
import { get, getWithDefault } from "../tools/env";
import { logger } from "../tools/logger";

export function startServer() {
  const port = getWithDefault("PORT", 8080);
  app.set("port", port);

  const server = http.createServer(app);

  function onError(error: any) {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    // Fall back to IPv4 if IPv6 (::) is explicitly disabled or unsupported by the host OS
    if (
      (error.code === "EAFNOSUPPORT" || error.code === "EADDRNOTAVAIL") &&
      server.address() === null
    ) {
      logger.warn(
        "IPv6 interface (::) is not available on host. Falling back to IPv4 (0.0.0.0)...",
      );
      server.listen(port, "0.0.0.0");
      return;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
    logger.debug(`Listening on ${bind}`);
  }

  connect()
    .then(async () => {
      // Attach error and listening handlers before initiating listen
      server.on("error", onError);
      server.on("listening", onListening);

      // Bind to dual-stack IPv6 (::), which handles both IPv4 and IPv6 traffic
      server.listen(port, "::");

      fixRunningImportsAtStart().catch(logger.error);
      checkBlacklistConsistency().catch(logger.error);
      const domain = get("CLIENT_ENDPOINT");
      if (domain.toLowerCase().includes("spotify")) {
        logger.warn(
          "Spotify was detected in CLIENT_ENDPOINT, Google might mark your entire domain as deceptive. https://github.com/Yooooomi/your_spotify/pull/254",
        );
      }
      dbLoop().catch(logger.error);
    })
    .catch(console.error);
}
