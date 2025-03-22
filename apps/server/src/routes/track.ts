import { Router } from "express";
import { z } from "zod";
import {
  getArtists,
  getTracks,
  getTrackListenedCount,
  getTrackFirstAndLastListened,
  bestPeriodOfTrack,
  getTrackRecentHistory,
  getRankOf,
  ItemType,
} from "../database";
import { getAlbums } from "../database/queries/album";
import { logger } from "../tools/logger";
import { isLoggedOrGuest, validating } from "../tools/middleware";
import { LoggedRequest, TypedPayload } from "../tools/types";

export const router = Router();

const getTracksSchema = z.object({
  ids: z.string(),
});

router.get(
  "/:ids",
  validating(getTracksSchema, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { ids } = req.params as TypedPayload<typeof getTracksSchema>;
      const tracks = await getTracks(ids.split(","));
      if (!tracks || tracks.length === 0) {
        res.status(404).end();
        return;
      }
      res.status(200).send(tracks);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const getTrackStats = z.object({
  id: z.string(),
});

router.get(
  "/:id/stats",
  validating(getTrackStats, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { user } = req as LoggedRequest;
      const { id } = req.params as TypedPayload<typeof getTrackStats>;
      const [track] = await getTracks([id]);
      const [trackArtist] = track?.artists ?? [];
      if (!track || !trackArtist) {
        res.status(404).end();
        return;
      }
      const promises = [
        getAlbums([track.album]),
        getTrackListenedCount(user, id),
        getArtists([trackArtist]),
        getTrackFirstAndLastListened(user, track.id),
        bestPeriodOfTrack(user, track.id),
        getTrackRecentHistory(user, track.id),
      ];
      const [[album], count, [artist], firstLast, bestPeriod, recentHistory] =
        await Promise.all(promises);
      if (!count) {
        res.status(200).send({ code: "NEVER_LISTENED" });
        return;
      }
      res.status(200).send({
        track,
        artist,
        album,
        bestPeriod,
        firstLast,
        recentHistory,
        total: {
          count,
        },
      });
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

router.get(
  "/:id/rank",
  validating(getTrackStats, "params"),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof getTrackStats>;

    try {
      const [track] = await getTracks([id]);
      if (!track) {
        res.status(404).end();
        return;
      }
      const rank = await getRankOf(ItemType.track, user, id);
      res.status(200).send(rank);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);
