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
import { isLoggedOrGuest, logged, validate } from "../tools/middleware";
import { LoggedRequest } from "../tools/types";

export const router = Router();

const getArtistsSchema = z.object({
  ids: z.string(),
});

router.get("/:ids", isLoggedOrGuest, async (req, res) => {
  const { ids } = validate(req.params, getArtistsSchema);
  const artists = await getArtists(ids.split(","));
  if (!artists || artists.length === 0) {
    res.status(404).end();
    return;
  }
  res.status(200).send(artists);
});

const getArtistStats = z.object({
  id: z.string(),
});

router.get("/:id/stats", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, getArtistStats);

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
});

router.get("/:id/rank", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, getArtistStats);

  const [artist] = await getArtists([id]);
  if (!artist) {
    res.status(404).end();
    return;
  }
  const rank = await getRankOf(ItemType.artist, user, id);
  res.status(200).send(rank);
});

const search = z.object({
  query: z.string().min(3).max(64),
});

router.get("/search/:query", isLoggedOrGuest, async (req, res) => {
  const { query } = validate(req.params, search);

  const results = await searchArtist(query);
  res.status(200).send(results);
});

const blacklist = z.object({
  id: z.string(),
});

router.post("/blacklist/:id", logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, blacklist);

  await blacklistArtist(user._id.toString(), id);
  await blacklistByArtist(user._id.toString(), id);
  res.status(204).end();
});

router.post("/unblacklist/:id", logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, blacklist);

  await unblacklistArtist(user._id.toString(), id);
  await unblacklistByArtist(user._id.toString(), id);
  res.status(204).end();
});
