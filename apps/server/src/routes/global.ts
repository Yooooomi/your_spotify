import { Router } from "express";
import { z } from "zod";
import { getGlobalPreferences, updateGlobalPreferences } from "../database";
import { admin, logged, validate } from "../tools/middleware";

export const router = Router();

router.get("/preferences", async (req, res) => {
  const preferences = await getGlobalPreferences();
  res.status(200).send(preferences);
});

const updateGlobalPreferencesSchema = z.object({
  allowRegistrations: z.boolean().optional(),
  allowAffinity: z.boolean().optional(),
});

router.post("/preferences", logged, admin, async (req, res) => {
  const modifications = validate(req.body, updateGlobalPreferencesSchema);

  const newPrefs = await updateGlobalPreferences(modifications);
  res.status(200).send(newPrefs);
});
