import { Router } from "express";
import { z } from "zod";
import {
  getAlbumSongs,
  getAlbums,
  getFirstAndLastListenedAlbum,
} from "../database/queries/album";
import { isLoggedOrGuest, validate } from "../tools/middleware";
import { LoggedRequest } from "../tools/types";
import { getArtists, getRankOf, ItemType } from "../database";

export const router = Router();

const getAlbumsSchema = z.object({
  ids: z.string(),
});

router.get("/:ids", isLoggedOrGuest, async (req, res) => {
  const { ids } = validate(req.params, getAlbumsSchema);
  const albums = await getAlbums(ids.split(","));
  if (!albums || albums.length === 0) {
    res.status(404).end();
    return;
  }
  res.status(200).send(albums);
});

const getAlbumStats = z.object({
  id: z.string(),
});

router.get("/:id/stats", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, getAlbumStats);
  const [album] = await getAlbums([id]);
  if (!album) {
    res.status(404).end();
    return;
  }
  const promises = [
    getFirstAndLastListenedAlbum(user, id),
    getAlbumSongs(user, id),
    getArtists(album.artists),
    // getTotalListeningOfAlbum(user, id),
  ];
  const [firstLast, tracks, artists] = await Promise.all(promises);
  res.status(200).send({
    album,
    artists,
    firstLast,
    tracks,
  });
});

router.get("/:id/rank", isLoggedOrGuest, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, getAlbumStats);
  const [album] = await getAlbums([id]);
  if (!album) {
    res.status(404).end();
    return;
  }
  const rank = await getRankOf(ItemType.album, user, id);
  res.status(200).send(rank);
});
