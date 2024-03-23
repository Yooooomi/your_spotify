/* eslint-disable @typescript-eslint/no-unused-vars */
import Axios from "axios";
import { generateRandomString, sha256 } from "../crypto";
import { credentials } from "./credentials";

export class Provider {
  static getRedirect = () => {};

  // @ts-ignore
  static exchangeCode = (code: string, state: string) => {};

  // @ts-ignore
  static refresh = refreshToken => {};

  // @ts-ignore
  static getUniqueID = accessToken => {};

  // @ts-ignore
  static getHttpClient = accessToken => {};
}

export class Spotify extends Provider {
  static getRedirect = async () => {
    const { scopes } = credentials.spotify;
    const { redirectUri } = credentials.spotify;

    const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
    const state = generateRandomString(32);

    authorizeUrl.searchParams.append("client_id", credentials.spotify.public);
    authorizeUrl.searchParams.append("response_type", "code");
    authorizeUrl.searchParams.append("redirect_uri", redirectUri);
    authorizeUrl.searchParams.append("state", state);
    authorizeUrl.searchParams.append("scope", scopes);

    return {
      url: authorizeUrl.toString(),
      state,
    };
  };

  static exchangeCode = async (code: string, state: string) => {
    const { data } = await Axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: credentials.spotify.redirectUri,
          client_id: credentials.spotify.public,
          client_secret: credentials.spotify.secret,
          state,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: Date.now() + data.expires_in * 1000,
    };
  };

  static refresh = async (refresh: string) => {
    const { data } = await Axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token: refresh,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${credentials.spotify.public}:${credentials.spotify.secret}`,
          ).toString("base64")}`,
        },
      },
    );

    return {
      accessToken: data.access_token as string,
      expiresIn: Date.now() + data.expires_in * 1000,
    };
  };

  static getHttpClient = (accessToken: string) =>
    Axios.create({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      baseURL: "https://api.spotify.com/v1",
    });
}
