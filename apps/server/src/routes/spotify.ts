import { Router } from "express";
import { z } from "zod";
import {
  getTrackBySpotifyId,
  getSongs,
  getSongsPer,
  getMostListenedSongs,
  getMostListenedArtist,
  getTimePer,
  albumDateRatio,
  featRatio,
  popularityPer,
  differentArtistsPer,
  getDayRepartition,
  getBestArtistsPer,
  getLongestListeningSession,
  getBest,
  ItemType,
  getBestOfHour,
} from "../database";
import {
  CollaborativeMode,
  getCollaborativeBestAlbums,
  getCollaborativeBestArtists,
  getCollaborativeBestSongs,
} from "../database/queries/collaborative";
import { DateFormatter, intervalToDisplay } from "../tools/date";
import { logger } from "../tools/logger";
import {
  affinityAllowed,
  isLoggedOrGuest,
  logged,
  validate,
  withHttpClient,
} from "../tools/middleware";
import { SpotifyRequest, LoggedRequest, Timesplit } from "../tools/types";
import { toDate, toNumber } from "../tools/zod";

export const router = Router();

const playSchema = z.object({
  id: z.string(),
});

router.post("/play", logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;
  const { id } = validate(req.body, playSchema);

  try {
    const track = await getTrackBySpotifyId(id);

    if (!track) {
      res.status(400).end();
      return;
    }
    await client.playTrack(track.uri);
    res.status(200).end();
  } catch (e) {
    if (e.response) {
      logger.error(e.response.data);
      res.status(400).send(e.response.data.error);
      return;
    }
    throw e;
  }
});

const gethistorySchema = z.object({
  number: z.preprocess(toNumber, z.number().max(20)),
  offset: z.preprocess(toNumber, z.number()),
  start: z.preprocess(toDate, z.date().optional()),
  end: z.preprocess(toDate, z.date().optional()),
});

router.get("/gethistory", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { number, offset, start, end } = validate(req.query, gethistorySchema);

  const tracks = await getSongs(
    user._id.toString(),
    offset,
    number,
    start && end ? { start, end } : undefined,
  );
  res.status(200).send(tracks);
});

const interval = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
});

const intervalPerSchema = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
  timeSplit: z.nativeEnum(Timesplit).default(Timesplit.day),
});

router.get("/listened_to", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = validate(req.query, interval);

  const result = await getSongsPer(user, start, end);
  if (result.length > 0) {
    res.status(200).send({ count: result[0].count });
    return;
  }
  res.status(200).send({ count: 0 });
});

router.get("/most_listened", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await getMostListenedSongs(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/most_listened_artist", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await getMostListenedArtist(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/songs_per", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await getSongsPer(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/time_per", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await getTimePer(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/album_date_ratio", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await albumDateRatio(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/feat_ratio", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await featRatio(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/popularity_per", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await popularityPer(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/different_artists_per", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await differentArtistsPer(user, start, end, timeSplit);
  res.status(200).send(result);
});

router.get("/time_per_hour_of_day", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = validate(req.query, interval);

  const result = await getDayRepartition(user, start, end);
  res.status(200).send(result);
});

router.get("/best_artists_per", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = validate(req.query, intervalPerSchema);

  const result = await getBestArtistsPer(user, start, end, timeSplit);
  res.status(200).send(result);
});

const intervalPerSchemaNbOffset = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
  nb: z.preprocess(toNumber, z.number().min(1).max(30)),
  offset: z.preprocess(toNumber, z.number().min(0).default(0)),
  sortKey: z.string().default("count"),
});

router.get("/top/songs", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, nb, offset, sortKey } = validate(
    req.query,
    intervalPerSchemaNbOffset,
  );

  const result = await getBest(ItemType.track, user, start, end, nb, offset);
  res.status(200).send(result);
});

router.get("/top/artists", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, nb, offset, sortKey } = validate(
    req.query,
    intervalPerSchemaNbOffset,
  );

  const result = await getBest(ItemType.artist, user, start, end, nb, offset);
  res.status(200).send(result);
});

router.get("/top/albums", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, nb, offset, sortKey } = validate(
    req.query,
    intervalPerSchemaNbOffset,
  );

  const result = await getBest(ItemType.album, user, start, end, nb, offset);
  res.status(200).send(result);
});

const collaborativeSchema = intervalPerSchema.merge(
  z.object({
    otherIds: z.array(z.string()).min(1),
    mode: z.nativeEnum(CollaborativeMode),
  }),
);

router.get(
  "/collaborative/top/songs",
  logged,
  affinityAllowed,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, otherIds, mode } = validate(
      req.query,
      collaborativeSchema,
    );

    const result = await getCollaborativeBestSongs(
      [user._id.toString(), ...otherIds.filter(e => e.length > 0)],
      start,
      end,
      mode,
      50,
    );
    res.status(200).send(result);
  },
);

router.get(
  "/collaborative/top/albums",
  logged,
  affinityAllowed,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, otherIds, mode } = validate(
      req.query,
      collaborativeSchema,
    );

    const result = await getCollaborativeBestAlbums(
      [user._id.toString(), ...otherIds],
      start,
      end,
      mode,
    );
    res.status(200).send(result);
  },
);

router.get(
  "/collaborative/top/artists",
  logged,
  affinityAllowed,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, otherIds, mode } = validate(
      req.query,
      collaborativeSchema,
    );

    const result = await getCollaborativeBestArtists(
      [user._id.toString(), ...otherIds],
      start,
      end,
      mode,
    );
    res.status(200).send(result);
  },
);

router.get("/top/hour-repartition/songs", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = validate(req.query, interval);

  const tracks = await getBestOfHour(ItemType.track, user, start, end);
  res.status(200).send(tracks);
});

router.get(
  "/top/hour-repartition/albums",
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = validate(req.query, interval);

    const albums = await getBestOfHour(ItemType.album, user, start, end);
    res.status(200).send(albums);
  },
);

router.get(
  "/top/hour-repartition/artists",
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = validate(req.query, interval);

    const artists = await getBestOfHour(ItemType.artist, user, start, end);
    res.status(200).send(artists);
  },
);

router.get("/top/sessions", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = validate(req.query, interval);

  const result = await getLongestListeningSession(
    user._id.toString(),
    start,
    end,
  );
  res.status(200).send(result);
});

router.get("/playlists", logged, withHttpClient, async (req, res) => {
  const { client, user } = req as LoggedRequest & SpotifyRequest;

  const playlists = await client.playlists();
  res
    .status(200)
    .send(playlists.filter(playlist => playlist.owner.id === user.spotifyId));
});

const createPlaylistBase = z.object({
  playlistId: z.string().optional(),
  name: z.string().optional(),
  sortKey: z.string().default("count"),
});

const createPlaylistFromTop = z.object({
  type: z.literal("top"),
  interval: z.object({
    start: z.preprocess(toDate, z.date()),
    end: z.preprocess(
      toDate,
      z.date().default(() => new Date()),
    ),
  }),
  nb: z.number(),
});

const createPlaylistFromAffinity = z.object({
  type: z.literal("affinity"),
  interval: z.object({
    start: z.preprocess(toDate, z.date()),
    end: z.preprocess(
      toDate,
      z.date().default(() => new Date()),
    ),
  }),
  nb: z.number(),
  userIds: z.array(z.string()),
  mode: z.nativeEnum(CollaborativeMode),
});

const createPlaylistFromSingle = z.object({
  type: z.literal("single"),
  songId: z.string(),
});

const createPlaylist = z.discriminatedUnion("type", [
  createPlaylistBase.merge(createPlaylistFromTop),
  createPlaylistBase.merge(createPlaylistFromSingle),
  createPlaylistBase.merge(createPlaylistFromAffinity),
]);

router.post("/playlist/create", logged, withHttpClient, async (req, res) => {
  const { client, user } = req as LoggedRequest & SpotifyRequest;
  const body = validate(req.body, createPlaylist);

  if (!body.playlistId && !body.name) {
    res.status(400).end();
    return;
  }

  let playlistName = body.name;
  let spotifyIds: string[];
  if (body.type === "top") {
    const { interval: intervalData, nb, sortKey } = body;
    const items = await getBest(
      ItemType.track,
      user,
      intervalData.start,
      intervalData.end,
      nb,
      0,
    );
    spotifyIds = items.map(item => item.track.id);
    if (!playlistName) {
      playlistName = `Top songs • ${intervalToDisplay(
        user.settings.dateFormat,
        intervalData.start,
        intervalData.end,
      )}`;
    }
  } else if (body.type === "affinity") {
    if (!playlistName) {
      playlistName = `Your Spotify Playlist • ${DateFormatter.toDayMonthYear(user.settings.dateFormat, new Date())}`;
    }
    const affinity = await getCollaborativeBestSongs(
      body.userIds,
      body.interval.start,
      body.interval.end,
      body.mode,
      body.nb,
    );
    spotifyIds = affinity.map(item => item.track.id);
  } else {
    if (!playlistName) {
      playlistName = `Your Spotify Playlist • ${DateFormatter.toDayMonthYear(user.settings.dateFormat, new Date())}`;
    }
    spotifyIds = [body.songId];
  }
  if (body.playlistId) {
    await client.addToPlaylist(body.playlistId, spotifyIds);
  } else {
    await client.createPlaylist(playlistName, spotifyIds);
  }
  res.status(204).end();
});
