import mongoose from "mongoose";
import { TrackModel, AlbumModel, ArtistModel } from "../database/Models";
import { Album } from "../database/schemas/album";
import { Artist } from "../database/schemas/artist";
import { SpotifyTrack, Track } from "../database/schemas/track";
import { logger } from "../tools/logger";
import { minOfArray, uniqBy } from "../tools/misc";
import { SpotifyAPI } from "../tools/apis/spotifyApi";
import {
	addTrackIdsToUser,
	storeInUser,
	storeFirstListenedAtIfLess,
} from "../database";
import { Infos } from "../database/schemas/info";
import { longWriteDbLock } from "../tools/lock";
import { Metrics } from "../tools/metrics";
import { compact } from "../tools/utils";

interface TracksAlbumsArtistsResult {
	tracks: Track[];
	albums: Album[];
	artists: Artist[];
	tracksBySpotifyId: Map<string, Track>;
}

interface TrackCanonicalizationResult {
	canonicalIdBySpotifyId: Map<string, string>;
	missingTrackIds: string[];
}

const spotifyTrackToStoredTrack = (track: SpotifyTrack): Track => ({
	...track,
	album: track.album.id,
	artists: track.artists.map((e) => e.id),
	isrc: track.external_ids?.isrc,
});

const getSpotifyTrackIsrcs = (spotifyTracks: SpotifyTrack[]) => [
	...new Set(
		spotifyTracks
			.map((track) => track.external_ids?.isrc)
			.filter((isrc): isrc is string => Boolean(isrc)),
	),
];

const getStoredTracksByIdOrIsrc = (ids: string[], isrcs: string[]) =>
	TrackModel.find({
		$or: [
			{ id: { $in: ids } },
			...(isrcs.length > 0
				? [{ isrc: { $in: isrcs }, mergedInto: { $exists: false } }]
				: []),
		],
	});

function canonicalizeSpotifyTracks(
	spotifyTracks: SpotifyTrack[],
	storedTracks: Track[],
): TrackCanonicalizationResult {
	const storedById = new Map(storedTracks.map((track) => [track.id, track]));
	const storedByIsrc = new Map(
		storedTracks
			.filter((track) => track.isrc && !track.mergedInto)
			.map((track) => [track.isrc!, track]),
	);
	const canonicalIdBySpotifyId = new Map<string, string>();
	const pendingCanonicalIdByIsrc = new Map<string, string>();
	const missingTrackIds: string[] = [];

	for (const spotifyTrack of spotifyTracks) {
		const isrc = spotifyTrack.external_ids?.isrc;
		const storedByMatchingIsrc = isrc ? storedByIsrc.get(isrc) : undefined;
		if (storedByMatchingIsrc) {
			canonicalIdBySpotifyId.set(spotifyTrack.id, storedByMatchingIsrc.id);
			continue;
		}

		const storedByMatchingId = storedById.get(spotifyTrack.id);
		if (storedByMatchingId) {
			const canonicalId = storedByMatchingId.mergedInto ?? storedByMatchingId.id;
			canonicalIdBySpotifyId.set(spotifyTrack.id, canonicalId);
			if (isrc && !pendingCanonicalIdByIsrc.has(isrc)) {
				pendingCanonicalIdByIsrc.set(isrc, canonicalId);
			}
			continue;
		}

		const pendingCanonicalId = isrc
			? pendingCanonicalIdByIsrc.get(isrc)
			: undefined;
		if (pendingCanonicalId) {
			canonicalIdBySpotifyId.set(spotifyTrack.id, pendingCanonicalId);
			continue;
		}

		canonicalIdBySpotifyId.set(spotifyTrack.id, spotifyTrack.id);
		missingTrackIds.push(spotifyTrack.id);
		if (isrc) {
			pendingCanonicalIdByIsrc.set(isrc, spotifyTrack.id);
		}
	}

	return { canonicalIdBySpotifyId, missingTrackIds };
}

const findMergedIntoTracks = async (storedTracks: Track[]) => {
	const mergedIntoIds = [
		...new Set(
			storedTracks
				.map((track) => track.mergedInto)
				.filter((id): id is string => Boolean(id)),
		),
	];
	return mergedIntoIds.length > 0
		? TrackModel.find({ id: { $in: mergedIntoIds } })
		: [];
};

async function updateExistingTrackIsrcs(
	spotifyTracks: SpotifyTrack[],
	storedTracks: Track[],
	canonicalIdBySpotifyId: Map<string, string>,
) {
	const storedById = new Map(storedTracks.map((track) => [track.id, track]));
	const updates = spotifyTracks.flatMap((track) => {
		const isrc = track.external_ids?.isrc;
		const storedTrack = storedById.get(track.id);
		if (
			!isrc ||
			!storedTrack ||
			storedTrack.mergedInto ||
			storedTrack.isrc === isrc ||
			canonicalIdBySpotifyId.get(track.id) !== track.id
		) {
			return [];
		}
		return [
			{
				updateOne: {
					filter: { id: track.id },
					update: { $set: { isrc } },
				},
			},
		];
	});

	if (updates.length === 0) {
		return;
	}

	try {
		await TrackModel.bulkWrite(updates, { ordered: false });
	} catch (error) {
		logger.warn("Could not update ISRCs on existing tracks", error);
	}
}

function mapSpotifyIdsToCanonicalTracks(
	spotifyTracks: SpotifyTrack[],
	canonicalIdBySpotifyId: Map<string, string>,
	tracks: Track[],
) {
	const tracksById = new Map(tracks.map((track) => [track.id, track]));

	return new Map(
		spotifyTracks.flatMap((track) => {
			const canonicalId = canonicalIdBySpotifyId.get(track.id);
			const storedTrack = canonicalId ? tracksById.get(canonicalId) : null;
			return storedTrack ? [[track.id, storedTrack] as const] : [];
		}),
	);
}

export const getTracks = async (userId: string, ids: string[]) => {
	const client = new SpotifyAPI(userId);
	const spotifyTracks = compact(await client.getTracks(ids));

	const tracks = spotifyTracks.map<Track>((track) => {
		logger.info(
			`Storing non existing track ${track.name} by ${track.artists[0]?.name}`,
		);
		return spotifyTrackToStoredTrack(track);
	});
	Metrics.ingestedTracksTotal.inc({ user: userId }, tracks.length);

	return tracks;
};

export const getAlbums = async (userId: string, ids: string[]) => {
	const client = new SpotifyAPI(userId);
	const spotifyAlbums = compact(await client.getAlbums(ids));

	const albums: Album[] = spotifyAlbums.map((alb) => {
		logger.info(
			`Storing non existing album ${alb.name} by ${alb.artists[0]?.name}`,
		);

		return {
			...alb,
			artists: alb.artists.map((art) => art.id),
		};
	});
	Metrics.ingestedAlbumsTotal.inc({ user: userId }, albums.length);

	return albums;
};

export const getArtists = async (userId: string, ids: string[]) => {
	const client = new SpotifyAPI(userId);
	const spotifyArtists = compact(await client.getArtists(ids));

	for (const spotifyArtist of spotifyArtists) {
		logger.info(`Storing non existing artist ${spotifyArtist.name}`);
	}

	Metrics.ingestedArtistsTotal.inc({ user: userId }, spotifyArtists.length);

	return spotifyArtists;
};

const getTracksAndRelatedAlbumArtists = async (
	userId: string,
	ids: string[],
) => {
	const tracks = await getTracks(userId, ids);

	return {
		tracks,
		artists: [...new Set(tracks.flatMap((e) => e.artists)).values()],
		albums: [...new Set(tracks.map((e) => e.album)).values()],
	};
};

const getSourceAlbumArtistIds = (spotifyTracks: SpotifyTrack[]) => ({
	artists: [
		...new Set(
			spotifyTracks
				.flatMap((track) => track.artists.map((artist) => artist.id))
				.filter(Boolean),
		),
	],
	albums: [
		...new Set(spotifyTracks.map((track) => track.album.id).filter(Boolean)),
	],
});

export const getTracksAlbumsArtists = async (
	userId: string,
	spotifyTracks: SpotifyTrack[],
): Promise<TracksAlbumsArtistsResult> => {
	if (spotifyTracks.length === 0) {
		return {
			tracks: [],
			albums: [],
			artists: [],
			tracksBySpotifyId: new Map<string, Track>(),
		};
	}

	const ids = spotifyTracks.map((track) => track.id);
	const isrcs = getSpotifyTrackIsrcs(spotifyTracks);
	const storedTracks: Track[] = await getStoredTracksByIdOrIsrc(ids, isrcs);
	const { canonicalIdBySpotifyId, missingTrackIds } =
		canonicalizeSpotifyTracks(spotifyTracks, storedTracks);
	const mergedIntoTracks: Track[] = await findMergedIntoTracks(storedTracks);

	await updateExistingTrackIsrcs(
		spotifyTracks,
		storedTracks,
		canonicalIdBySpotifyId,
	);

	const {
		tracks,
		artists: relatedArtists,
		albums: relatedAlbums,
	} =
		missingTrackIds.length > 0
			? await getTracksAndRelatedAlbumArtists(userId, missingTrackIds)
			: { tracks: [], artists: [], albums: [] };
	if (missingTrackIds.length === 0) {
		logger.info("No missing tracks, passing...");
	}
	const sourceRelated = getSourceAlbumArtistIds(spotifyTracks);
	const allRelatedAlbums = [
		...new Set([...relatedAlbums, ...sourceRelated.albums]),
	];
	const allRelatedArtists = [
		...new Set([...relatedArtists, ...sourceRelated.artists]),
	];

	const storedAlbums: Album[] = await AlbumModel.find({
		id: { $in: allRelatedAlbums },
	});
	const missingAlbumIds = allRelatedAlbums.filter(
		(alb) =>
			!storedAlbums.find((salb) => salb.id.toString() === alb.toString()),
	);

	const storedArtists: Artist[] = await ArtistModel.find({
		id: { $in: allRelatedArtists },
	});
	const missingArtistIds = allRelatedArtists.filter(
		(alb) =>
			!storedArtists.find((salb) => salb.id.toString() === alb.toString()),
	);

	const albums =
		missingAlbumIds.length > 0 ? await getAlbums(userId, missingAlbumIds) : [];
	const artists =
		missingArtistIds.length > 0
			? await getArtists(userId, missingArtistIds)
			: [];

	return {
		tracks,
		albums,
		artists,
		tracksBySpotifyId: mapSpotifyIdsToCanonicalTracks(
			spotifyTracks,
			canonicalIdBySpotifyId,
			[...storedTracks, ...mergedIntoTracks, ...tracks],
		),
	};
};

export async function storeTrackAlbumArtist({
	tracks,
	albums,
	artists,
}: {
	tracks?: Track[];
	albums?: Album[];
	artists?: Artist[];
}) {
	if (tracks) {
		const uniqueTracks = uniqBy(tracks, (item) => item.id);
		if (uniqueTracks.length > 0) {
			await TrackModel.bulkWrite(
				uniqueTracks.map((track) => ({
					updateOne: {
						filter: { id: track.id },
						update: { $set: track },
						upsert: true,
					},
				})),
			);
		}
	}
	if (albums) {
		await AlbumModel.create(uniqBy(albums, (item) => item.id));
	}
	if (artists) {
		await ArtistModel.create(uniqBy(artists, (item) => item.id));
	}
}

export async function storeIterationOfLoop(
	userId: string,
	iterationTimestamp: number,
	tracks: Track[],
	albums: Album[],
	artists: Artist[],
	infos: Omit<Infos, "owner">[],
) {
	await longWriteDbLock.lock();

	try {
		await storeTrackAlbumArtist({
			tracks,
			albums,
			artists,
		});

		await addTrackIdsToUser(userId, infos);

		await storeInUser("_id", new mongoose.Types.ObjectId(userId), {
			lastTimestamp: iterationTimestamp,
		});

		const min = minOfArray(infos, (item) => item.played_at.getTime());

		if (min) {
			const minInfo = infos[min.minIndex]?.played_at;
			if (minInfo) {
				await storeFirstListenedAtIfLess(userId, minInfo);
			}
		}
	} finally {
		longWriteDbLock.unlock();
	}
}
