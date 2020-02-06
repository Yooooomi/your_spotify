const Joi = require('joi');
const jwt = require('jsonwebtoken');
const db = require('../database');

const validating = (schema, location = 'body') => (req, res, next) => {
  const { error, value } = Joi.validate(req[location], schema);

  if (error) {
    console.error(error);
    return res.status(400).end();
  }

  req.values = value;

  return next();
};

const logged = async (req, res, next) => {
  const auth = req.cookies['token'];

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
}

module.exports = {
  validating,
  logged,
};
