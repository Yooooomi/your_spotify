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

let corsValue = get("CORS")?.split(",");
if (corsValue?.[0] === "all") {
  corsValue = undefined;
}

app.use(
  cors({
    origin: corsValue ?? true,
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  }),
);

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
