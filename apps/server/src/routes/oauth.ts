import { Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import { z } from "zod";
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
  validating,
  withGlobalPreferences,
  withHttpClient,
} from "../tools/middleware";
import { Spotify } from "../tools/oauth/Provider";
import {
  GlobalPreferencesRequest,
  SpotifyRequest,
  TypedPayload,
} from "../tools/types";
import { getPrivateData } from "../database/queries/privateData";

export const router = Router();

function storeTokenInCookie(
  request: Request,
  response: Response,
  token: string,
) {
  response.cookie("token", token, {
    sameSite: "strict",
    httpOnly: true,
    secure: request.secure,
  });
}

const OAUTH_COOKIE_NAME = "oauth";
const spotifyCallbackOAuthCookie = z.object({
  state: z.string(),
});
type OAuthCookie = z.infer<typeof spotifyCallbackOAuthCookie>;

router.get("/spotify", async (req, res) => {
  const isOffline = get("OFFLINE_DEV_ID");
  if (isOffline) {
    const privateData = await getPrivateData();
    if (!privateData?.jwtPrivateKey) {
      throw new Error("No private data found, cannot sign JWT");
    }
    const token = sign({ userId: isOffline }, privateData.jwtPrivateKey, {
      expiresIn: getWithDefault("COOKIE_VALIDITY_MS", "1h"),
    });
    storeTokenInCookie(req, res, token);
    res.status(204).end();
    return;
  }
  const { url, state } = await Spotify.getRedirect();
  const oauthCookie: OAuthCookie = {
    state,
  };

  res.cookie(OAUTH_COOKIE_NAME, oauthCookie, {
    sameSite: "lax",
    httpOnly: true,
    secure: req.secure,
  });

  res.redirect(url);
});

const spotifyCallback = z.object({
  code: z.string(),
  state: z.string(),
});

router.get(
  "/spotify/callback",
  validating(spotifyCallback, "query"),
  withGlobalPreferences,
  async (req, res) => {
    const { query, globalPreferences } = req as GlobalPreferencesRequest;
    const { code, state } = query as TypedPayload<typeof spotifyCallback>;

    try {
      const cookie = spotifyCallbackOAuthCookie.parse(
        req.cookies[OAUTH_COOKIE_NAME],
      );

      if (state !== cookie.state) {
        throw new Error("State does not match");
      }

      const infos = await Spotify.exchangeCode(code, cookie.state);

      const client = Spotify.getHttpClient(infos.accessToken);
      const { data: spotifyMe } = await client.get("/me");
      let user = await getUserFromField("spotifyId", spotifyMe.id, false);
      if (!user) {
        if (!globalPreferences.allowRegistrations) {
          return res.redirect(
            `${get("CLIENT_ENDPOINT")}/registrations-disabled`,
          );
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
      storeTokenInCookie(req, res, token);
    } catch (e) {
      logger.error(e);
    } finally {
      res.clearCookie(OAUTH_COOKIE_NAME);
    }
    return res.redirect(get("CLIENT_ENDPOINT"));
  },
);

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
