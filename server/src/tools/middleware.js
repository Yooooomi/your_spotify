const jwt = require('jsonwebtoken');
const db = require('../database');
const logger = require('./logger');
const { Spotify } = require('./oauth/Provider');

const validating = (schema, location = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[location]);

  if (error) {
    logger.error(error);
    return res.status(400).end();
  }

  req.values = value;

  return next();
};

const logged = async (req, res, next) => {
  const auth = req.cookies.token;

  if (!auth) return res.status(401).end();

  if (auth) {
    try {
      const userId = jwt.verify(auth, 'MyPrivateKey');

      const user = await db.getUserFromField('_id', userId.userId, false);

      if (!user) {
        return res.status(401).end();
      }
      req.user = user;
      return next();
    } catch (e) {
      return res.status(401).end();
    }
  }
  return res.status(401).end();
};

const withHttpClient = async (req, res, next) => {
  const { user } = req;

  let tokens = user;

  if (user.expiresIn < Date.now()) {
    try {
      const newTokens = await Spotify.refresh(user.refreshToken);
      await db.storeInUser('_id', user._id, newTokens);
      tokens = newTokens;
    } catch (e) {
      if (e.response) {
        logger.error(e.response.data);
      } else {
        logger.error(e);
      }
      return res.status(400).end();
    }
  }
  const client = Spotify.getHttpClient(tokens.accessToken);
  req.client = client;
  return next();
};

const withGlobalPreferences = async (req, res, next) => {
  try {
    const pref = await db.getGlobalPreferences();
    req.globalPreferences = pref;
    return next();
  } catch (e) {
    return res.status(500).end();
  }
};

module.exports = {
  validating,
  logged,
  withHttpClient,
  withGlobalPreferences,
};
