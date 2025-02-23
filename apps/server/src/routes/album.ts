import { Router } from "express";
import { z } from "zod";
import {
  getAlbumSongs,
  getAlbums,
  getFirstAndLastListenedAlbum,
} from "../database/queries/album";
import { logger } from "../tools/logger";
import { isLoggedOrGuest, measureRequestDuration, validating } from "../tools/middleware";
import { LoggedRequest, TypedPayload } from "../tools/types";
import { getArtists, getRankOf, ItemType } from "../database";

export const router = Router();

const getAlbumsSchema = z.object({
  ids: z.string(),
});

router.get(
  "/:ids",
  validating(getAlbumsSchema, "params"),
  isLoggedOrGuest,
  measureRequestDuration("/album/:ids"),
  async (req, res) => {
    try {
      const { ids } = req.params as TypedPayload<typeof getAlbumsSchema>;
      const albums = await getAlbums(ids.split(","));
      if (!albums || albums.length === 0) {
        res.status(404).end();
        return;
      }
      res.status(200).send(albums);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const getAlbumStats = z.object({
  id: z.string(),
});

router.get(
  "/:id/stats",
  validating(getAlbumStats, "params"),
  isLoggedOrGuest,
  measureRequestDuration("/album/:id/stats"),
  async (req, res) => {
    try {
      const { user } = req as LoggedRequest;
      const { id } = req.params as TypedPayload<typeof getAlbumStats>;
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
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

router.get(
  "/:id/rank",
  validating(getAlbumStats, "params"),
  isLoggedOrGuest,
  measureRequestDuration("/album/:id/rank"),
  async (req, res) => {
    try {
      const { user } = req as LoggedRequest;
      const { id } = req.params as TypedPayload<typeof getAlbumStats>;
      const [album] = await getAlbums([id]);
      if (!album) {
        res.status(404).end();
        return;
      }
      const rank = await getRankOf(ItemType.album, user, id);
      res.status(200).send(rank);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);
