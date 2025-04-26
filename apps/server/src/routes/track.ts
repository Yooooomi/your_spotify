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
import { isLoggedOrGuest, validate } from "../tools/middleware";
import { LoggedRequest } from "../tools/types";

export const router = Router();

const getTracksSchema = z.object({
  ids: z.string(),
});

router.get("/:ids", isLoggedOrGuest, async (req, res) => {
  const { ids } = validate(req.params, getTracksSchema);
  const tracks = await getTracks(ids.split(","));
  if (!tracks || tracks.length === 0) {
    res.status(404).end();
    return;
  }
  res.status(200).send(tracks);
});

const getTrackStats = z.object({
  id: z.string(),
});

router.get("/:id/stats", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, getTrackStats);
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
});

router.get("/:id/rank", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, getTrackStats);

  const [track] = await getTracks([id]);
  if (!track) {
    res.status(404).end();
    return;
  }
  const rank = await getRankOf(ItemType.track, user, id);
  res.status(200).send(rank);
});
