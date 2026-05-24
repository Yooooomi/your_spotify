import { AxiosError } from "axios";
import { Types } from "mongoose";
import { getUserFromField, storeInUser } from "../../database";
import { SpotifyTrack } from "../../database/schemas/track";
import { logger } from "../logger";
import { chunk } from "../misc";
import { Spotify } from "../oauth/Provider";
import { SpotifyAlbum } from "../../database/schemas/album";
import { SpotifyArtist } from "../../database/schemas/artist";
import { RetryAfterAwareAxiosClient } from "./spotifyApiClient";

interface SpotifyMe {
	id: string;
}

interface SpotifyPlaylist {
	id: string;
	name: string;
	owner: {
		id: string;
	};
}

export class SpotifyAPI {
	private client!: RetryAfterAwareAxiosClient;

	constructor(private readonly userId: string) { }

	private async checkToken() {
		const user = await getUserFromField(
			"_id",
			new Types.ObjectId(this.userId),
			true,
		);
		let access: string | null | undefined = user?.accessToken;
		if (!user) {
			throw new Error("User not found");
		}
		if (!user.spotifyId) {
			throw new Error("User has no spotify id");
		}
		// Refresh the token if it expires in less than two minutes (1000ms * 120)
		if (Date.now() > user.expiresIn - 1000 * 120) {
			const token = user.refreshToken;
			if (!token) {
				return;
			}
			const infos = await Spotify.refresh(token);

			await storeInUser("_id", user._id, infos);
			logger.info(`Refreshed token for ${user.username}`);
			access = infos.accessToken;
		}
		if (access) {
			this.client = Spotify.getHttpClient(access);
		} else {
			throw new Error("Could not get any access token");
		}
	}

	public async raw(url: string) {
		await this.checkToken();
		return this.client.instance.get(url);
	}

	public async playTrack(trackUri: string) {
		await this.checkToken();
		return this.client.instance.put("https://api.spotify.com/v1/me/player/play", {
			uris: [trackUri],
		});
	}

	public async me() {
		await this.checkToken();
		const res = await this.client.instance.get("/me");
		return res.data as SpotifyMe;
	}

	public async playlists() {
		const items: SpotifyPlaylist[] = [];

		let nextUrl = "/me/playlists?limit=50";
		while (nextUrl) {
			const thisUrl = nextUrl;

			await this.checkToken();
			const res = await this.client.instance.get(thisUrl);
			nextUrl = res.data.next;
			items.push(...res.data.items);
		}
		return items;
	}

	private async handleAddIdsToPlaylist(id: string, ids: string[]) {
		const chunks = chunk(ids, 100);
		for (let i = 0; i < chunks.length; i += 1) {
			const chk = chunks[i]!;

			await this.client.instance.post(`/playlists/${id}/tracks`, {
				uris: chk.map((trackId) => `spotify:track:${trackId}`),
			});
		}
	}

	public async addToPlaylist(id: string, ids: string[]) {
		await this.checkToken();
		return this.handleAddIdsToPlaylist(id, ids);
	}

	public async createPlaylist(name: string, ids: string[]) {
		await this.checkToken();
		const { data } = await this.client.instance.post(`/me/playlists`, {
			name,
			public: true,
			collaborative: false,
			description: "",
		});
		return this.handleAddIdsToPlaylist(data.id, ids);
	}

	async getTrack(id: string) {
		try {
			await this.checkToken();
			const res = await this.client.instance.get(`/tracks/${id}`);
			return res.data as SpotifyTrack;
		} catch {
			return undefined;
		}
	}

	async getTracks(spotifyIds: string[]) {
		const tracks: (SpotifyTrack | undefined)[] = [];
		for (const id of spotifyIds) {
			const track = await this.getTrack(id);
			tracks.push(track);
		}
		return tracks;
	}

	async getAlbum(id: string) {
		try {
			await this.checkToken();
			const res = await this.client.instance.get(`/albums/${id}`);
			return res.data as SpotifyAlbum;
		} catch {
			return undefined;
		}
	}

	async getAlbums(spotifyIds: string[]) {
		const albums: (SpotifyAlbum | undefined)[] = [];
		for (const id of spotifyIds) {
			const album = await this.getAlbum(id);
			albums.push(album);
		}
		return albums;
	}

	async getArtist(id: string) {
		try {
			await this.checkToken();
			const res = await this.client.instance.get(`/artists/${id}`);
			return res.data as SpotifyArtist;
		} catch {
			return undefined;
		}
	}

	async getArtists(spotifyIds: string[]) {
		const artists: (SpotifyArtist | undefined)[] = [];
		for (const id of spotifyIds) {
			const artist = await this.getArtist(id);
			artists.push(artist);
		}
		return artists;
	}

	public async search(track: string, artist: string) {
		try {
			await this.checkToken();
			const limitedTrack = track.slice(0, 100);
			const limitedArtist = artist.slice(0, 100);
			const res = await this.client.instance.get(
				`/search?q=track:${encodeURIComponent(
					limitedTrack,
				)}+artist:${encodeURIComponent(limitedArtist)}&type=track&limit=10`,
			);
			return res.data.tracks.items[0] as SpotifyTrack;
		} catch (e) {
			if (e instanceof AxiosError) {
				if (e.response?.status === 404) {
					return undefined;
				}
			}
			throw e;
		}
	}
}
