const mongoose = require('mongoose');
const Schemas = require('./Schemas');

const User = require('./User');

const wait = ms => new Promise((s, f) => setTimeout(s, ms));

const connect = async () => {
  while (1) {
    try {
      console.log('Trying to connect');
      await mongoose.connect('mongodb://mongo:27017/your_spotify', {useNewUrlParser: true});
      console.log('Connected !');
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
  ...User,
};
