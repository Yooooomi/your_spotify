import { Router } from 'express';
import { z } from 'zod';
import { getGlobalPreferences, updateGlobalPreferences } from '../database';
import { admin, logged, validating } from '../tools/middleware';
import { TypedPayload } from '../tools/types';

const router = Router();
export default router;

router.get('/preferences', async (req, res) => {
  const preferences = await getGlobalPreferences();
  return res.status(200).send(preferences);
});

const updateGlobalPreferencesSchema = z.object({
  allowRegistrations: z.boolean(),
});

router.post(
  '/preferences',
  validating(updateGlobalPreferencesSchema),
  logged,
  admin,
  async (req, res) => {
    const modifications = req.body as TypedPayload<
      typeof updateGlobalPreferencesSchema
    >;

    const newPrefs = await updateGlobalPreferences(modifications);
    return res.status(200).send(newPrefs);
  },
);
