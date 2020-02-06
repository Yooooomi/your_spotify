const { User } = require('./Schemas');
const { NoResult } = require('../tools/errors/Database');

const getUserFromField = async (field, value, crash = true) => {
  const user = User.findOne({ [field]: value });

  if (!user && crash) {
    throw new NoResult();
  }
  return user;
}

const createUser = (username, password) => {
  return User.create({
    username,
    password,
  });
}

const storeInUser = (field, value, infos) => {
  return User.findOneAndUpdate({ [field]: value }, infos, { new: true });
}

const addTrackIdsToUser = (field, value, ids) => {
  return User.findOneAndUpdate({ [field]: value }, { $push: { trackIds: ids } });
}

const getFullUser = (id, tracksNb = 10, tracksOffset = 0) => {
  return User.findById(id).populate({
    path: 'tracks',
    options: {
      limit: tracksNb,
      skip: tracksOffset,
    },
    populate: [
      {
        path: 'full_artist',
        model: 'Artist',
      },
      {
        path: 'full_album',
        model: 'Album',
      },
    ],
  });
}

const getUsersNb = () => User.find().count();
const getUsers = (nb, offset, condition) => User.find(condition).limit(nb).skip(offset);

module.exports = {
  getUserFromField,
  createUser,
  storeInUser,
  getFullUser,
  getUsersNb,
  getUsers,
  addTrackIdsToUser,
};
