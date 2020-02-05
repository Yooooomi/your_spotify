var express = require('express');
var router = express.Router();
const Joi = require('joi');
const { validating } = require('../tools/middleware');
const constants = require('../tools/constants');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hello !');
});

const registerSchema = Joi.object().keys({
  username: Joi.string().max(constants.maxStringLength).required(),
  password: Joi.string().max(constants.maxStringLength).required(),
});

router.post('/register', validating(registerSchema), (req, res) => {

});

const loginSchema = Joi.object().keys({
  username: Joi.string().max(constants.maxStringLength).required(),
  password: Joi.string().max(constants.maxStringLength).required(),
});

router.post('/login', validating(loginSchema), async (req, res) => {

});

module.exports = router;
