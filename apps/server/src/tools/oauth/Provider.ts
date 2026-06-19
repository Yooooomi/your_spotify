import { spotifyHttpClientFactory } from "../apis/queuedHttpClient.providers";
import { QueuedHttpClient } from "../apis/queueHttpClient";
import { generateRandomString } from "../crypto";
import { credentials } from "./credentials";

export interface Provider {
  getRedirect(): Promise<{ url: string; state: string }>;
  exchangeCode(
    code: string,
    state: string,
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }>;
  refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }>;
  getHttpClient(accessToken: string): QueuedHttpClient;
}

export class Spotify implements Provider {
  private readonly client = spotifyHttpClientFactory.createClient();

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly scopes: string,
    private readonly redirectUri: string,
  ) {}

  async getRedirect() {
    const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
    const state = generateRandomString(32);

    authorizeUrl.searchParams.append("client_id", this.clientId);
    authorizeUrl.searchParams.append("response_type", "code");
    authorizeUrl.searchParams.append("redirect_uri", this.redirectUri);
    authorizeUrl.searchParams.append("state", state);
    authorizeUrl.searchParams.append("scope", this.scopes);

    return { url: authorizeUrl.toString(), state };
  }

  async exchangeCode(code: string, state: string) {
    const { data } = await this.client.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          state,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: Date.now() + data.expires_in * 1000,
    };
  }

  async refresh(refresh: string) {
    const { data } = await this.client.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: { grant_type: "refresh_token", refresh_token: refresh },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`,
          ).toString("base64")}`,
        },
      },
    );

    return {
      accessToken: data.access_token as string,
      expiresIn: Date.now() + data.expires_in * 1000,
    };
  }

  getHttpClient(accessToken: string) {
    return spotifyHttpClientFactory.createClient({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      baseURL: "https://api.spotify.com/v1",
    });
  }
}

export const spotifyProvider = new Spotify(
  credentials.spotify.public,
  credentials.spotify.secret,
  credentials.spotify.scopes,
  credentials.spotify.redirectUri,
);
