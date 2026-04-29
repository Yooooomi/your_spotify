import { Router } from "express";
import { z } from "zod";
import {
  getArtists,
  getTracks,
  getTrackListenedCount,
  getTrackFirstAndLastListened,
  getTrackListenedAlbums,
  bestPeriodOfTrack,
  getTrackRecentHistory,
  getRankOf,
  ItemType,
} from "../database";
import { getAlbums } from "../database/queries/album";
import { Artist } from "../database/schemas/artist";
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
  if (!track) {
    res.status(404).end();
    return;
  }
  const promises = [
    getAlbums([track.album]),
    getTrackListenedCount(user, id),
    getArtists(track.artists),
    getTrackFirstAndLastListened(user, track.id),
    getTrackListenedAlbums(user, track.id),
    bestPeriodOfTrack(user, track.id),
    getTrackRecentHistory(user, track.id),
  ];
  const [
    [album],
    count,
    artists,
    firstLast,
    listenedOn,
    bestPeriod,
    recentHistory,
  ] =
    await Promise.all(promises);
  const orderedArtists = track.artists
    .map(artistId => artists.find((artist: Artist) => artist.id === artistId))
    .filter((artist): artist is Artist => Boolean(artist));
  if (!count) {
    res.status(200).send({ code: "NEVER_LISTENED" });
    return;
  }
  res.status(200).send({
    track,
    artists: orderedArtists,
    album,
    listenedOn,
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
