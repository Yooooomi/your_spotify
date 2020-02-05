const Joi = require('joi');

const validating = (schema, location = 'body') => (req, res, next) => {
  const { error, value } = Joi.validate(req[location], schema);

  if (error) {
    return res.status(400).end();
  }

  req.values = value;

  return next();
};

module.exports = {
  validating,
};
