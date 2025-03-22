import { Router } from "express";
import { z } from "zod";
import {
  getArtists,
  getFirstAndLastListened,
  getMostListenedSongOfArtist,
  bestPeriodOfArtist,
  getTotalListeningOfArtist,
  searchArtist,
  getDayRepartitionOfArtist,
  blacklistArtist,
  unblacklistArtist,
  blacklistByArtist,
  unblacklistByArtist,
  getMostListenedAlbumOfArtist,
  getRankOf,
  ItemType,
} from "../database";
import { logger } from "../tools/logger";
import { isLoggedOrGuest, logged, validating } from "../tools/middleware";
import { LoggedRequest, TypedPayload } from "../tools/types";

export const router = Router();

const getArtistsSchema = z.object({
  ids: z.string(),
});

router.get(
  "/:ids",
  validating(getArtistsSchema, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { ids } = req.params as TypedPayload<typeof getArtistsSchema>;
      const artists = await getArtists(ids.split(","));
      if (!artists || artists.length === 0) {
        res.status(404).end();
        return;
      }
      res.status(200).send(artists);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const getArtistStats = z.object({
  id: z.string(),
});

router.get(
  "/:id/stats",
  validating(getArtistStats, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { user } = req as LoggedRequest;
      const { id } = req.params as TypedPayload<typeof getArtistStats>;

      const [artist] = await getArtists([id]);
      if (!artist) {
        res.status(404).end();
        return;
      }
      const promises = [
        getFirstAndLastListened(user, id),
        getMostListenedSongOfArtist(user, id),
        getMostListenedAlbumOfArtist(user, id),
        bestPeriodOfArtist(user, id),
        getTotalListeningOfArtist(user, id),
        getDayRepartitionOfArtist(user, id),
      ];
      const [
        firstLast,
        mostListened,
        albumMostListened,
        bestPeriod,
        total,
        dayRepartition,
      ] = await Promise.all(promises);
      if (!total) {
        res.status(200).send({
          code: "NEVER_LISTENED",
        });
        return;
      }
      res.status(200).send({
        artist,
        firstLast,
        mostListened,
        albumMostListened,
        bestPeriod,
        total,
        dayRepartition,
      });
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

router.get(
  "/:id/rank",
  validating(getArtistStats, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof getArtistStats>;

    try {
      const [artist] = await getArtists([id]);
      if (!artist) {
        res.status(404).end();
        return;
      }
      const rank = await getRankOf(ItemType.artist, user, id);
      res.status(200).send(rank);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const search = z.object({
  query: z.string().min(3).max(64),
});

router.get(
  "/search/:query",
  validating(search, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    const { query } = req.params as TypedPayload<typeof search>;

    try {
      const results = await searchArtist(query);
      res.status(200).send(results);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const blacklist = z.object({
  id: z.string(),
});

router.post(
  "/blacklist/:id",
  validating(blacklist, "params"),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof blacklist>;

    try {
      await blacklistArtist(user._id.toString(), id);
      await blacklistByArtist(user._id.toString(), id);
      res.status(204).end();
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

router.post(
  "/unblacklist/:id",
  validating(blacklist, "params"),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof blacklist>;

    try {
      await unblacklistArtist(user._id.toString(), id);
      await unblacklistByArtist(user._id.toString(), id);
      res.status(204).end();
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);
