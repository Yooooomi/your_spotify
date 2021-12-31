const mongoose = require('mongoose');
const Schemas = require('./Schemas');
const Models = require('./Models');
const logger = require('../tools/logger');

const statQueries = require('./queries/stats');
const userQueries = require('./queries/user');
const globalQueries = require('./queries/global');
const artistQueries = require('./queries/artist');

const connect = async () => {
  logger.debug('Trying to connect to database');
  const fallbackConnection = 'mongodb://mongo:27017/your_spotify';
  const client = await mongoose.connect(
    process.env.MONGO_ENDPOINT || fallbackConnection,
    {
      connectTimeoutMS: 3000,
    },
  );
  logger.debug('Connected to database !');
  return client;
};

module.exports = {
  connect,
  ...Schemas,
  ...Models,
  ...statQueries,
  ...userQueries,
  ...globalQueries,
  ...artistQueries,
};
