import { Router } from "express";
import { z } from "zod";
import { searchArtist, searchTrack } from "../database";
import { isLoggedOrGuest, validate } from "../tools/middleware";
import { searchAlbum } from "../database/queries/album";

export const router = Router();

const search = z.object({
  query: z.string().min(3).max(64),
});

router.get("/:query", isLoggedOrGuest, async (req, res) => {
  const { query } = validate(req.params, search);

  const [artists, tracks, albums] = await Promise.all([
    searchArtist(query),
    searchTrack(query),
    searchAlbum(query),
  ]);
  res.status(200).send({ artists, tracks, albums });
});
