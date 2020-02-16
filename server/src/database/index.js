const mongoose = require('mongoose');
const Schemas = require('./Schemas');
const logger = require('../tools/logger');

const statQueries = require('./queries/stats');
const userQueries = require('./queries/user');

const wait = ms => new Promise((s, f) => setTimeout(s, ms));

const connect = async () => {
  while (1) {
    try {
      logger.debug('Trying to connect to database');
      await mongoose.connect('mongodb://mongo:27017/your_spotify', { useNewUrlParser: true });
      logger.debug('Connected to database !');
      return;
    } catch (e) {
      await wait(1000);
    }
  }
}

/*Schemas.User.findOne().then(async user => {
  const full = await User.getFullUser(user._id);
  console.log(JSON.stringify(full));
});*/

module.exports = {
  connect,
  ...Schemas,
  ...statQueries,
  ...userQueries,
};
