import { Router } from "express";
import { sign } from "jsonwebtoken";
import {
  createUser,
  getUserCount,
  getUserFromField,
  storeInUser,
} from "../database";
import { get, getWithDefault } from "../tools/env";
import { logger } from "../tools/logger";
import {
  logged,
  withGlobalPreferences,
  withHttpClient,
} from "../tools/middleware";
import { Spotify } from "../tools/oauth/Provider";
import { GlobalPreferencesRequest, SpotifyRequest } from "../tools/types";
import { getPrivateData } from "../database/queries/privateData";

export const router = Router();

router.get("/spotify", async (_, res) => {
  const isOffline = get("OFFLINE_DEV_ID");
  if (isOffline) {
    const privateData = await getPrivateData();
    if (!privateData?.jwtPrivateKey) {
      throw new Error("No private data found, cannot sign JWT");
    }
    const token = sign({ userId: isOffline }, privateData.jwtPrivateKey, {
      expiresIn: getWithDefault("COOKIE_VALIDITY_MS", "1h"),
    });
    res.cookie("token", token);
    res.status(204).end();
    return;
  }
  res.redirect(Spotify.getRedirect());
});

router.get("/spotify/callback", withGlobalPreferences, async (req, res) => {
  const { query, globalPreferences } = req as GlobalPreferencesRequest;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code as string);

  try {
    const client = Spotify.getHttpClient(infos.accessToken);
    const { data: spotifyMe } = await client.get("/me");
    let user = await getUserFromField("spotifyId", spotifyMe.id, false);
    if (!user) {
      if (!globalPreferences.allowRegistrations) {
        return res.redirect(`${get("CLIENT_ENDPOINT")}/registrations-disabled`);
      }
      const nbUsers = await getUserCount();
      user = await createUser(
        spotifyMe.display_name,
        spotifyMe.id,
        nbUsers === 0,
      );
    }
    await storeInUser("_id", user._id, infos);
    const privateData = await getPrivateData();
    if (!privateData?.jwtPrivateKey) {
      throw new Error("No private data found, cannot sign JWT");
    }
    const token = sign(
      { userId: user._id.toString() },
      privateData.jwtPrivateKey,
      {
        expiresIn: getWithDefault("COOKIE_VALIDITY_MS", "1h"),
      },
    );
    res.cookie("token", token);
  } catch (e) {
    logger.error(e);
  }
  return res.redirect(get("CLIENT_ENDPOINT"));
});

router.get("/spotify/me", logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;

  try {
    const me = await client.me();
    return res.status(200).send(me);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ code: "SPOTIFY_ERROR" });
  }
});
