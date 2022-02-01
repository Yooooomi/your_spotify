import { Types } from "mongoose";
import { NoResult } from "../../tools/errors/Database";
import { InfosModel, UserModel } from "../Models";
import { Infos } from "../schemas/info";
import { User } from "../schemas/user";

export const getSongsNbInterval = async (
  id: string,
  start: Date,
  end: Date
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: id, played_at: { $gt: start, $lt: end } } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  return res[0].count;
};

export const getUserFromField = async <F extends keyof User>(
  field: F,
  value: User[F],
  crash = true
) => {
  const user = UserModel.findOne({ [field]: value }, "-tracks");

  if (!user && crash) {
    throw new NoResult();
  }
  return user;
};

export const createUser = (username: string, password: string) =>
  UserModel.create({
    username,
    password,
    activated: false,
    accessToken: "",
    refreshToken: "",
    expiresIn: 0,
    // Set last timestamp to yesterday so that we already have a pull of tracks
    lastTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    settings: {
      historyLine: false,
      preferredStatsPeriod: "month",
      nbElements: 10,
      metricUsed: "number",
    },
  });

export const storeInUser = <F extends keyof User>(
  field: F,
  value: User[F],
  infos: Partial<User>
) => UserModel.findOneAndUpdate({ [field]: value }, infos, { new: true });

export const changeSetting = <F extends keyof User>(
  field: F,
  value: User[F],
  infos: Partial<User["settings"]>
) => {
  const obj: Record<string, any> = {};
  Object.keys(infos).forEach((key) => {
    obj[`settings.${key}`] = infos[key as keyof typeof infos];
  });
  return UserModel.findOneAndUpdate(
    { [field]: value },
    { $set: obj },
    { new: true }
  );
};

export const addTrackIdsToUser = async (
  id: string,
  infos: Omit<Infos, "owner">[]
) => {
  const realInfos = infos.map((info) => ({
    ...info,
    owner: new Types.ObjectId(id),
  }));
  const infosSaved = await InfosModel.create(realInfos);
  return UserModel.findByIdAndUpdate(id, {
    $push: { tracks: { $each: infosSaved.map((e) => e._id.toString()) } },
  });
};

export const getSongs = async (
  userId: string,
  offset: number,
  number: number
) => {
  const fullUser = await UserModel.findById(userId).populate({
    path: "tracks",
    model: "Infos",
    options: { skip: offset, limit: number, sort: { played_at: -1 } },
    populate: {
      path: "track",
      model: "Track",
      populate: [
        { path: "full_album", model: "Album" },
        { path: "full_artist", model: "Artist" },
      ],
    },
  });
  if (!fullUser) {
    return [];
  }
  return fullUser.tracks;
};

export const getSongsInterval = async (id: string, start: Date, end: Date) => {
  const user = await UserModel.findById(id).populate({
    path: "tracks",
    match: {
      played_at: {
        $gte: start,
        $lt: end,
      },
    },
  });
  if (!user) {
    return [];
  }
  return user.tracks;
};

export const getUsersNb = () => UserModel.find().countDocuments();
export const getUsers = (
  nb: number,
  offset: number,
  condition: Partial<User>
) => UserModel.find(condition).limit(nb).skip(offset);
