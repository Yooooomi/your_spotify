const { NoResult } = require('../../tools/errors/Database');
const { Infos, User } = require('../Schemas');

const getSongsNbInterval = async (id, start, end) => {
  const res = await Infos.aggregate([
    { $match: { owner: id, played_at: { $gt: start, $lt: end } } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  return res[0].count;
};

const getUserFromField = async (field, value, crash = true) => {
  const user = User.findOne({ [field]: value }, '-tracks');

  if (!user && crash) {
    throw new NoResult();
  }
  return user;
};

const createUser = (username, password) => User.create({
  username,
  password,
  activated: false,
  accessToken: '',
  refreshToken: '',
  expiresIn: 0,
  // Set last timestamp to yesterday so that we already have a pull of tracks
  lastTimestamp: Date.now() - 1000 * 60 * 60 * 24,
  settings: {
    historyLine: false,
    preferredStatsPeriod: 'month',
    nbElements: 10,
    metricUsed: 'number',
  },
});

const storeInUser = (field, value, infos) => User
  .findOneAndUpdate({ [field]: value }, infos, { new: true });

const changeSetting = (field, value, infos) => {
  const obj = {};
  Object.keys(infos).forEach(key => {
    obj[`settings.${key}`] = infos[key];
  });
  return User.findOneAndUpdate({ [field]: value }, { $set: obj }, { new: true });
};

const addTrackIdsToUser = async (id, infos) => {
  infos.forEach(info => { info.owner = id; });
  const infosSaved = await Infos.create(infos);
  return User.findByIdAndUpdate(
    id,
    { $push: { tracks: { $each: infosSaved.map(e => e._id.toString()) } } },
  );
};

const getSongs = async (userId, offset, number) => {
  // const tracks = Infos
  //   .find({ owner: userId })
  //   .sort({ played_at: -1 })
  //   .skip(offset)
  //   .limit(number)
  //   .populate({
  //     path: 'track',
  //     model: 'Track',
  //     populate: [
  //       { path: 'full_album', model: 'Album' },
  //       { path: 'full_artist', model: 'Artist' },
  //     ],
  //   });

  const fullUser = await User.findById(userId).populate(
    {
      path: 'tracks',
      model: 'Infos',
      options: { skip: offset, limit: number, sort: { played_at: -1 } },
      populate: {
        path: 'track',
        model: 'Track',
        populate: [
          { path: 'full_album', model: 'Album' },
          { path: 'full_artist', model: 'Artist' },
        ],
      },
    },
  );
  return fullUser.tracks;
};

const getSongsInterval = async (id, start, end) => {
  const user = await User.findById(id).populate({
    path: 'tracks',
    match: {
      played_at: {
        $gte: start,
        $lt: end,
      },
    },
  });
  return user.tracks;
};

const getUsersNb = () => User.find().countDocuments();
const getUsers = (nb, offset, condition) => User.find(condition).limit(nb).skip(offset);

module.exports = {
  getSongsNbInterval,
  getUserFromField,
  createUser,
  storeInUser,
  changeSetting,
  addTrackIdsToUser,
  getSongs,
  getSongsInterval,
  getUsersNb,
  getUsers,
};
