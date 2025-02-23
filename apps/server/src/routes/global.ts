import { Router } from "express";
import { z } from "zod";
import { getGlobalPreferences, updateGlobalPreferences } from "../database";
import { admin, logged, measureRequestDuration, validating } from "../tools/middleware";
import { TypedPayload } from "../tools/types";

export const router = Router();

router.get(
  "/preferences",
  measureRequestDuration("/global/preferences"),
  async (req, res) => {
    const preferences = await getGlobalPreferences();
    res.status(200).send(preferences);
  }
);

const updateGlobalPreferencesSchema = z.object({
  allowRegistrations: z.boolean(),
});

router.post(
  "/preferences",
  validating(updateGlobalPreferencesSchema),
  logged,
  admin,
  measureRequestDuration("/global/preferences"),
  async (req, res) => {
    const modifications = req.body as TypedPayload<
      typeof updateGlobalPreferencesSchema
    >;

    const newPrefs = await updateGlobalPreferences(modifications);
    res.status(200).send(newPrefs);
  },
);
