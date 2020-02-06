var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bp = require('body-parser');

var app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())

var indexRouter = require('./routes/index');
var oauthRouter = require('./routes/oauth');
var spotifyRouter = require('./routes/spotify');
var usersRouter = require('./routes/users');

app.use((req, res, next) => {
  const origin = req.get('origin');

  console.log(origin);

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, x-id, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', true);

  next();
});

app.use('/', indexRouter);
app.use('/oauth', oauthRouter);
app.use('/spotify', spotifyRouter);
app.use('/users', usersRouter);

app.use(function(err, req, res, next) {
  console.log('Crash !!');
  if (err) {
    console.error(err);
  }
  return res.status(500).end();
});

module.exports = app;
