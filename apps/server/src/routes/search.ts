import { Router } from "express";
import { z } from "zod";
import { searchArtist, searchTrack } from "../database";
import { logger } from "../tools/logger";
import { isLoggedOrGuest, measureRequestDuration, validating } from "../tools/middleware";
import { TypedPayload } from "../tools/types";
import { searchAlbum } from "../database/queries/album";

export const router = Router();

const search = z.object({
  query: z.string().min(3).max(64),
});

router.get(
  "/:query",
  validating(search, "params"),
  isLoggedOrGuest,
  measureRequestDuration("/search/:query"),
  async (req, res) => {
    const { query } = req.params as TypedPayload<typeof search>;

    try {
      const [artists, tracks, albums] = await Promise.all([
        searchArtist(query),
        searchTrack(query),
        searchAlbum(query),
      ]);
      res.status(200).send({ artists, tracks, albums });
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);
