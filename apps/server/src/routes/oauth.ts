import { Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import { z } from "zod";

import {
  createUser,
  getUserCount,
  getUserFromField,
  storeInUser,
} from "../database";
import { getPrivateData } from "../database/queries/privateData";
import { spotifyHttpClientFactory } from "../tools/apis/queuedHttpClient.providers";
import {
  HttpError,
  RateLimitedError,
  USER_FACING_MAX_RETRY_AFTER_MS,
} from "../tools/apis/queueHttpClient";
import { SpotifyMe } from "../tools/apis/spotifyApi";
import { get, getWithDefault } from "../tools/env";
import { logger } from "../tools/logger";
import {
  logged,
  loginRateLimit,
  validate,
  withGlobalPreferences,
  withHttpClient,
} from "../tools/middleware";
import { spotifyProvider } from "../tools/oauth/Provider";
import { GlobalPreferencesRequest, SpotifyRequest } from "../tools/types";

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
const spotifyCallbackOAuthCookie = z.object({ state: z.string() });
type OAuthCookie = z.infer<typeof spotifyCallbackOAuthCookie>;

router.get("/spotify", loginRateLimit, async (req, res) => {
  const isOffline = get("OFFLINE_DEV_ID");
  if (isOffline) {
    const privateData = await getPrivateData();
    if (!privateData?.jwtPrivateKey) {
      throw new Error("No private data found, cannot sign JWT");
    }
    const token = sign({ userId: isOffline }, privateData.jwtPrivateKey, {
      expiresIn: getWithDefault("COOKIE_VALIDITY_MS", "1h") as `${number}`,
    });
    storeTokenInCookie(req, res, token);
    res.status(204).end();
    return;
  }
  const { url, state } = await spotifyProvider.getRedirect();
  const oauthCookie: OAuthCookie = { state };

  res.cookie(OAUTH_COOKIE_NAME, oauthCookie, {
    sameSite: "lax",
    httpOnly: true,
    secure: req.secure,
  });

  res.redirect(url);
});

const spotifyCallback = z.object({ code: z.string(), state: z.string() });

// Sends the user back to the login page with a reason, so the client can
// explain the failure instead of silently starting a new login (which loops
// when "Remember me" is checked).
function loginErrorUrl(error: unknown) {
  const url = new URL(`${get("CLIENT_ENDPOINT")}/login`);
  if (error instanceof RateLimitedError) {
    url.searchParams.set("error", "rate_limited");
    url.searchParams.set(
      "retry_after",
      Math.max(1, Math.ceil(error.retryAfterMs / 1000)).toString(),
    );
  } else if (error instanceof HttpError && error.status === 403) {
    // Spotify apps in development mode only accept allowlisted users
    url.searchParams.set("error", "not_registered");
  } else {
    url.searchParams.set("error", "unknown");
  }
  return url.toString();
}

router.get("/spotify/callback", withGlobalPreferences, async (req, res) => {
  const { query, globalPreferences } = req as GlobalPreferencesRequest;
  const { code, state } = validate(query, spotifyCallback);

  let failureRedirect: string | undefined;
  try {
    const cookie = spotifyCallbackOAuthCookie.parse(
      req.cookies[OAUTH_COOKIE_NAME],
    );

    if (state !== cookie.state) {
      throw new Error("State does not match");
    }

    // Exchanging the code goes through the same queue as every Spotify call,
    // don't make the user wait behind a long Retry-After.
    const rateLimitRemainingMs =
      spotifyHttpClientFactory.getRateLimitRemainingMs();
    if (rateLimitRemainingMs > USER_FACING_MAX_RETRY_AFTER_MS) {
      throw new RateLimitedError(rateLimitRemainingMs);
    }

    const infos = await spotifyProvider.exchangeCode(code, cookie.state);

    const client = spotifyProvider.getHttpClient(infos.accessToken);
    const { data: spotifyMe } = await client.get<SpotifyMe>("/me", {
      priority: "high",
      maxRetryAfterMs: USER_FACING_MAX_RETRY_AFTER_MS,
    });
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
      { expiresIn: getWithDefault("COOKIE_VALIDITY_MS", "1h") as `${number}` },
    );
    storeTokenInCookie(req, res, token);
  } catch (e) {
    logger.error(e);
    failureRedirect = loginErrorUrl(e);
  } finally {
    res.clearCookie(OAUTH_COOKIE_NAME);
  }
  return res.redirect(failureRedirect ?? get("CLIENT_ENDPOINT"));
});

router.get("/spotify/me", logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;

  console.log("WYTFUDGZJDGHZAKJHDKJZHZDKJHAZJKDHZAJKDHJKAHZ");

  try {
    const me = await client.me();
    res.status(200).send(me);
  } catch (e) {
    logger.error(e);
    res.status(500).send({ code: "SPOTIFY_ERROR" });
  }
});
