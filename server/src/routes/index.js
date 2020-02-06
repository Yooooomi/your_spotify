var express = require('express');
var router = express.Router();
const Joi = require('joi');
const { validating, logged } = require('../tools/middleware');
const constants = require('../tools/constants');
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.status(200).send('Hello !');
});

const registerSchema = Joi.object().keys({
  username: Joi.string().max(constants.maxStringLength).required(),
  password: Joi.string().max(constants.maxStringLength).required(),
});

router.post('/register', validating(registerSchema), async (req, res) => {
  const { username, password } = req.values;

  const alreadyExisting = await db.getUserFromField('username', username, false);

  if (alreadyExisting) {
    return res.status(409).end();
  }

  const hashedPassword = bcrypt.hashSync(password, 14);

  const newUser = await db.createUser(username, hashedPassword);
  return res.status(200).send(newUser);
});

const loginSchema = Joi.object().keys({
  username: Joi.string().max(constants.maxStringLength).required(),
  password: Joi.string().max(constants.maxStringLength).required(),
});

router.post('/login', validating(loginSchema), async (req, res) => {
  const { username, password } = req.values;

  const user = await db.getUserFromField('username', username, false);

  if (!user) {
    return res.status(400).end();
  }

  // TODO filter user

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).end();
  }

  // TODO store key
  const token = jwt.sign({ userId: user._id.toString() }, 'MyPrivateKey', {
    expiresIn: '1h',
  });

  res.cookie('token', token);

  return res.status(200).send({
    user,
    token,
  });
});

router.get('/me', logged, async (req, res) => {
  console.log(req.user);
  return res.status(200).send(req.user);
});

module.exports = router;
