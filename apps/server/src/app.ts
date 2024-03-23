import * as path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import { router as indexRouter } from "./routes";
import { router as oauthRouter } from "./routes/oauth";
import { router as spotifyRouter } from "./routes/spotify";
import { router as globalRouter } from "./routes/global";
import { router as artistRouter } from "./routes/artist";
import { router as albumRouter } from "./routes/album";
import { router as importRouter } from "./routes/importer";
import { router as trackRouter } from "./routes/track";
import { router as searchRouter } from "./routes/search";
import { get } from "./tools/env";
import { LogLevelAccepts } from "./tools/logger";

const app = express();
const ALLOW_ALL_CORS =
  "i-want-a-security-vulnerability-and-want-to-allow-all-origins";

let corsValue: string[] | undefined = get("CORS")?.split(",") ?? [
  new URL(get("CLIENT_ENDPOINT")).origin,
];
if (corsValue?.[0] === ALLOW_ALL_CORS) {
  corsValue = undefined;
}

app.use(
  cors({
    origin: corsValue ?? true,
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  }),
);

app.use((_, res, next) => {
  // Apply security headers for the whole backend here

  // Apply a restrictive CSP for the server API just in case. As there isn't any
  // HTML content here, "default-src 'none'" is a good deny-all default in case
  // an attacker tries something funny.
  // "frame-ancestors 'none'" is required because frame-ancestors doesn't fall
  // back to default-src and nobody has legitimate business framing the backend.
  res.header(
    "Content-Security-Policy",
    "default-src 'none'; object-src 'none'; frame-ancestors 'none';",
  );

  // Prevent MIME sniffing in browsers
  res.header("X-Content-Type-Options", "nosniff");
  next();
});

if (LogLevelAccepts("info")) {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRouter);
app.use("/oauth", oauthRouter);
app.use("/spotify", spotifyRouter);
app.use("/global", globalRouter);
app.use("/artist", artistRouter);
app.use("/album", albumRouter);
app.use("/track", trackRouter);
app.use("/search", searchRouter);
app.use("/", importRouter);

export { app };
