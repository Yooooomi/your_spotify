const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/oauth');
const spotifyRouter = require('./routes/spotify');
const globalRouter = require('./routes/global');
const artistRouter = require('./routes/artist');

const cors = process.env.CORS || '';
const corsList = cors.split(',');

app.use((req, res, next) => {
  let origin = null;
  const thisOrigin = req.get('origin');

  if (cors === 'all') {
    origin = thisOrigin;
  } else {
    const index = corsList.indexOf(thisOrigin);

    if (index >= 0) {
      origin = corsList[index];
    }
  }

  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, x-id, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', true);
  }

  next();
});

app.use('/', indexRouter);
app.use('/oauth', oauthRouter);
app.use('/spotify', spotifyRouter);
app.use('/global', globalRouter);
app.use('/artist', artistRouter);

module.exports = app;
