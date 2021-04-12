const express = require('express');

const router = express.Router();
const Joi = require('joi');
const { logged, validating } = require('../tools/middleware');
const db = require('../database');

router.get('/preferences', async (req, res) => {
  const preferences = await db.getGlobalPreferences();
  return res.status(200).send(preferences);
});

const updateGlobalPreferences = Joi.object().keys({
  allowRegistrations: Joi.boolean().required(),
});

router.post('/preferences', validating(updateGlobalPreferences), logged, async (req, res) => {
  const modifications = req.values;

  const newPrefs = await db.updateGlobalPreferences(modifications);
  return res.status(200).send(newPrefs);
});

module.exports = router;
