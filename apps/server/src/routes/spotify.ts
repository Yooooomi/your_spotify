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
  isLoggedOrGuest,
  logged,
  validating,
  withHttpClient,
} from "../tools/middleware";
import {
  SpotifyRequest,
  LoggedRequest,
  Timesplit,
  TypedPayload,
} from "../tools/types";
import { toDate, toNumber } from "../tools/zod";

export const router = Router();

const playSchema = z.object({
  id: z.string(),
});

router.post(
  "/play",
  validating(playSchema),
  logged,
  withHttpClient,
  async (req, res) => {
    const { client } = req as SpotifyRequest;
    const { id } = req.body as TypedPayload<typeof playSchema>;

    try {
      const track = await getTrackBySpotifyId(id);

      if (!track) return res.status(400).end();
      await client.playTrack(track.uri);
      return res.status(200).end();
    } catch (e) {
      if (e.response) {
        logger.error(e.response.data);
        return res.status(400).send(e.response.data.error);
      }
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const gethistorySchema = z.object({
  number: z.preprocess(toNumber, z.number().max(20)),
  offset: z.preprocess(toNumber, z.number()),
  start: z.preprocess(toDate, z.date().optional()),
  end: z.preprocess(toDate, z.date().optional()),
});

router.get(
  "/gethistory",
  validating(gethistorySchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { number, offset, start, end } = req.query as TypedPayload<
      typeof gethistorySchema
    >;

    const tracks = await getSongs(
      user._id.toString(),
      offset,
      number,
      start && end ? { start, end } : undefined,
    );
    return res.status(200).send(tracks);
  },
);

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

router.get(
  "/listened_to",
  validating(interval, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = req.query as TypedPayload<typeof interval>;

    try {
      const result = await getSongsPer(user, start, end);
      if (result.length > 0) {
        return res.status(200).send({ count: result[0].count });
      }
      return res.status(200).send({ count: 0 });
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/most_listened",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await getMostListenedSongs(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/most_listened_artist",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await getMostListenedArtist(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/songs_per",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await getSongsPer(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/time_per",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await getTimePer(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/album_date_ratio",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await albumDateRatio(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/feat_ratio",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await featRatio(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/popularity_per",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await popularityPer(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/different_artists_per",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await differentArtistsPer(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/time_per_hour_of_day",
  validating(interval, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = req.query as TypedPayload<typeof interval>;

    try {
      const result = await getDayRepartition(user, start, end);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/best_artists_per",
  validating(intervalPerSchema, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<
      typeof intervalPerSchema
    >;

    try {
      const result = await getBestArtistsPer(user, start, end, timeSplit);
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const intervalPerSchemaNbOffset = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
  nb: z.preprocess(toNumber, z.number().min(1).max(30)),
  offset: z.preprocess(toNumber, z.number().min(0).default(0)),
});

router.get(
  "/top/songs",
  validating(intervalPerSchemaNbOffset, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query as TypedPayload<
      typeof intervalPerSchemaNbOffset
    >;

    try {
      const result = await getBest(
        ItemType.track,
        user,
        start,
        end,
        nb,
        offset,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/top/artists",
  validating(intervalPerSchemaNbOffset, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query as TypedPayload<
      typeof intervalPerSchemaNbOffset
    >;

    try {
      const result = await getBest(
        ItemType.artist,
        user,
        start,
        end,
        nb,
        offset,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/top/albums",
  validating(intervalPerSchemaNbOffset, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query as TypedPayload<
      typeof intervalPerSchemaNbOffset
    >;

    try {
      const result = await getBest(
        ItemType.album,
        user,
        start,
        end,
        nb,
        offset,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const collaborativeSchema = intervalPerSchema.merge(
  z.object({
    otherIds: z.array(z.string()).min(1),
    mode: z.nativeEnum(CollaborativeMode),
  }),
);

router.get(
  "/collaborative/top/songs",
  validating(collaborativeSchema, "query"),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, otherIds, mode } = req.query as TypedPayload<
      typeof collaborativeSchema
    >;

    try {
      const result = await getCollaborativeBestSongs(
        [user._id.toString(), ...otherIds.filter(e => e.length > 0)],
        start,
        end,
        mode,
        50,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/collaborative/top/albums",
  validating(collaborativeSchema, "query"),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, otherIds, mode } = req.query as TypedPayload<
      typeof collaborativeSchema
    >;

    try {
      const result = await getCollaborativeBestAlbums(
        [user._id.toString(), ...otherIds],
        start,
        end,
        mode,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/collaborative/top/artists",
  validating(collaborativeSchema, "query"),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, otherIds, mode } = req.query as TypedPayload<
      typeof collaborativeSchema
    >;

    try {
      const result = await getCollaborativeBestArtists(
        [user._id.toString(), ...otherIds],
        start,
        end,
        mode,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/top/hour-repartition/songs",
  validating(interval, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = req.query as TypedPayload<typeof interval>;

    try {
      const tracks = await getBestOfHour(ItemType.track, user, start, end);
      return res.status(200).send(tracks);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/top/hour-repartition/albums",
  validating(interval, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = req.query as TypedPayload<typeof interval>;

    try {
      const albums = await getBestOfHour(ItemType.album, user, start, end);
      return res.status(200).send(albums);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/top/hour-repartition/artists",
  validating(interval, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = req.query as TypedPayload<typeof interval>;

    try {
      const artists = await getBestOfHour(ItemType.artist, user, start, end);
      return res.status(200).send(artists);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  "/top/sessions",
  validating(interval, "query"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end } = req.query as TypedPayload<typeof interval>;

    try {
      const result = await getLongestListeningSession(
        user._id.toString(),
        start,
        end,
      );
      return res.status(200).send(result);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get("/playlists", logged, withHttpClient, async (req, res) => {
  const { client, user } = req as LoggedRequest & SpotifyRequest;

  try {
    const playlists = await client.playlists();
    return res
      .status(200)
      .send(playlists.filter(playlist => playlist.owner.id === user.spotifyId));
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

const createPlaylistBase = z.object({
  playlistId: z.string().optional(),
  name: z.string().optional(),
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

router.post(
  "/playlist/create",
  validating(createPlaylist),
  logged,
  withHttpClient,
  async (req, res) => {
    const { client, user } = req as LoggedRequest & SpotifyRequest;
    const body = req.body as TypedPayload<typeof createPlaylist>;

    if (!body.playlistId && !body.name) {
      return res.status(400).end();
    }

    try {
      let playlistName = body.name;
      let spotifyIds: string[];
      if (body.type === "top") {
        const { interval: intervalData, nb } = body;
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
      return res.status(204).end();
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);
