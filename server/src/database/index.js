const mongoose = require('mongoose');
const Schemas = require('./Schemas');
const logger = require('../tools/logger');

const statQueries = require('./queries/stats');
const userQueries = require('./queries/user');
const globalQueries = require('./queries/global');

const connect = async () => {
  logger.debug('Trying to connect to database');
  const fallbackConnection = 'mongodb://mongo:27017/your_spotify';
  const client = await mongoose.connect(
    process.env.MONGO_ENDPOINT || fallbackConnection,
    {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      connectTimeoutMS: 3000,
    },
  );
  logger.debug('Connected to database !');
  return client;
};

/* Schemas.User.findOne().then(async user => {
  const full = await User.getFullUser(user._id);
  console.log(JSON.stringify(full));
}); */

module.exports = {
  connect,
  ...Schemas,
  ...statQueries,
  ...userQueries,
  ...globalQueries,
};
