import { Router } from "express";
import Joi from "joi";
import { getGlobalPreferences, updateGlobalPreferences } from "../database";
import { logged, validating } from "../tools/middleware";

const router = Router();
export default router;

router.get("/preferences", async (req, res) => {
  const preferences = await getGlobalPreferences();
  return res.status(200).send(preferences);
});

const updateGlobalPreferencesSchema = Joi.object().keys({
  allowRegistrations: Joi.boolean().required(),
});

router.post(
  "/preferences",
  validating(updateGlobalPreferencesSchema),
  logged,
  async (req, res) => {
    const modifications = req.body;

    const newPrefs = await updateGlobalPreferences(modifications);
    return res.status(200).send(newPrefs);
  }
);

module.exports = router;
