import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

import indexRouter from "./routes/index";
import oauthRouter from "./routes/oauth";
import spotifyRouter from "./routes/spotify";
import globalRouter from "./routes/global";
import artistRouter from "./routes/artist";

const cors = process.env.CORS || "";
const corsList = cors.split(",");

app.use((req, res, next) => {
  let origin = null;
  const thisOrigin = req.get("origin");

  if (!thisOrigin) {
    return next();
  }
  if (cors === "all") {
    origin = thisOrigin;
  } else {
    const index = corsList.indexOf(thisOrigin);

    if (index >= 0) {
      origin = corsList[index];
    }
  }

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Authorization, x-id, Content-Length, X-Requested-With"
    );
    res.header("Access-Control-Allow-Credentials", "true");
  }

  next();
});

app.use("/", indexRouter);
app.use("/oauth", oauthRouter);
app.use("/spotify", spotifyRouter);
app.use("/global", globalRouter);
app.use("/artist", artistRouter);

export default app;
