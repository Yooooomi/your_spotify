import { Types } from "mongoose";
import { NoResult } from "../../tools/errors/Database";
import {
  AlbumModel,
  ArtistModel,
  InfosModel,
  TrackModel,
  UserModel,
} from "../Models";
import { Infos } from "../schemas/info";
import { User } from "../schemas/user";

export const getUserFromField = async <F extends keyof User>(
  field: F,
  value: User[F],
  includeTokens: boolean,
  crash = true,
) => {
  const user = UserModel.findOne(
    { [field]: value },
    includeTokens ? "-tracks" : "-tracks -accessToken -refreshToken",
  );

  if (!user && crash) {
    throw new NoResult();
  }
  return user;
};

export const getAllUsers = (includeTokens: boolean) =>
  UserModel.find(
    {},
    includeTokens ? "-tracks" : "-tracks -accessToken -refreshToken",
  );

export const createUser = (
  username: string,
  spotifyId: string,
  admin: boolean,
) =>
  UserModel.create({
    username,
    admin,
    spotifyId,
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
      dateFormat: "default",
    },
  });

export const storeInUser = <F extends keyof User>(
  field: F,
  value: User[F],
  infos: Partial<User>,
) => UserModel.findOneAndUpdate({ [field]: value }, infos, { new: true });

export const storeFirstListenedAtIfLess = async (
  userId: string,
  playedAt: Date,
) => {
  const id = new Types.ObjectId(userId);
  const user = await getUserFromField("_id", id, false);
  if (
    user &&
    (!user.firstListenedAt ||
      playedAt.getTime() < user.firstListenedAt.getTime())
  ) {
    await storeInUser("_id", id, {
      firstListenedAt: playedAt,
    });
  }
};

export const changeSetting = <F extends keyof User>(
  field: F,
  value: User[F],
  infos: Partial<User["settings"]>,
) => {
  const toSet: Record<string, any> = {};
  const toUnset: Record<string, any> = {};
  Object.keys(infos).forEach(key => {
    const finalValue = infos[key as keyof typeof infos];
    if (finalValue === undefined) {
      toUnset[`settings.${key}`] = 1;
    } else {
      toSet[`settings.${key}`] = finalValue;
    }
  });
  return UserModel.findOneAndUpdate(
    { [field]: value },
    { $set: toSet, $unset: toUnset },
    { new: true },
  );
};

export const addTrackIdsToUser = async (
  id: string,
  infos: Omit<Infos, "owner">[],
) => {
  const realInfos = infos.map(info => ({
    ...info,
    owner: new Types.ObjectId(id),
  }));
  const infosSaved = await InfosModel.create(realInfos);
  return UserModel.findByIdAndUpdate(id, {
    $push: { tracks: { $each: infosSaved.map(e => e._id) } },
  });
};

export const getCloseTrackId = async (
  userId: string,
  trackId: string,
  date: Date,
  secondsPlusMinus: number,
) => {
  const startDate = new Date(date.getTime());
  const endDate = new Date(date.getTime());
  startDate.setSeconds(startDate.getSeconds() - secondsPlusMinus);
  endDate.setSeconds(endDate.getSeconds() + secondsPlusMinus);
  return InfosModel.find({
    owner: userId,
    id: trackId,
    played_at: { $gt: startDate, $lt: endDate },
  });
};

export const getUserInfoCount = async (userId: string) => {
  return InfosModel.countDocuments({ owner: new Types.ObjectId(userId) });
};

export const getPossibleDuplicates = async (
  userId: string,
  secondsPlusMinus: number,
  count: number,
  offset: number,
) => {
  return InfosModel.aggregate([
    { $match: { owner: new Types.ObjectId(userId) } },
    { $sort: { played_at: 1 } },
    { $skip: offset },
    { $limit: count },
    {
      $group: {
        _id: "$id",
        infos: { $push: "$$ROOT" },
      },
    },
    {
      $addFields: {
        a: {
          $reduce: {
            input: "$infos",
            initialValue: { duplicates: [] },
            in: {
              last: "$$this",
              duplicates: {
                $concatArrays: [
                  "$$value.duplicates",
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $gt: ["$$value.last.played_at", null] },
                          {
                            $lt: [
                              {
                                $subtract: [
                                  "$$this.played_at",
                                  "$$value.last.played_at",
                                ],
                              },
                              secondsPlusMinus * 1000,
                            ],
                          },
                        ],
                      },
                      then: [
                        [
                          "$$value.last",
                          "$$this",
                          {
                            $subtract: [
                              "$$this.played_at",
                              "$$value.last.played_at",
                            ],
                          },
                        ],
                      ],
                      else: [],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        duplicates: "$a.duplicates",
        hasDuplicates: {
          $cond: [{ $gt: [{ $size: "$a.duplicates" }, 0] }, true, false],
        },
      },
    },
    { $match: { hasDuplicates: true } },
  ]);
};

export const getSongs = async (
  userId: string,
  offset: number,
  number: number,
  inter?: { start: Date; end: Date },
) => {
  const fullUser = await UserModel.findById(userId).populate({
    path: "tracks",
    model: "Infos",
    match: {
      ...(inter
        ? { played_at: { $gt: inter.start, $lt: inter.end } }
        : undefined),
      blacklistedBy: { $exists: 0 },
    },
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

export const getUserCount = () => UserModel.countDocuments();
export const getUser = (nb: number) =>
  UserModel.find().sort({ _id: "asc" }).skip(nb).limit(1);

export const deleteAllInfosFromUserId = (userId: string) =>
  InfosModel.deleteMany({ owner: userId });
export const deleteUser = (userId: string) =>
  UserModel.findByIdAndDelete(userId);

export const deleteAllOrphanTracks = async () => {
  const tracks = await TrackModel.aggregate([
    {
      $lookup: {
        as: "infos",
        from: "infos",
        localField: "id",
        foreignField: "id",
      },
    },
    { $match: { $expr: { $eq: [{ $size: "$infos" }, 0] } } },
  ]);

  const tracksToDelete = tracks.map(tr => tr._id);
  await TrackModel.deleteMany({ _id: { $in: tracksToDelete } });

  const albums = await AlbumModel.aggregate([
    {
      $lookup: {
        as: "tracks",
        from: "tracks",
        localField: "id",
        foreignField: "album",
      },
    },
    { $match: { $expr: { $eq: [{ $size: "$tracks" }, 0] } } },
  ]);

  const albumsToDelete = albums.map(alb => alb._id);
  await AlbumModel.deleteMany({ _id: { $in: albumsToDelete } });

  const artists = await ArtistModel.aggregate([
    {
      $lookup: {
        as: "albums",
        from: "albums",
        localField: "id",
        foreignField: "artists",
      },
    },
    {
      $lookup: {
        as: "tracks",
        from: "tracks",
        localField: "id",
        foreignField: "artists",
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $eq: [{ $size: "$albums" }, 0] },
            { $eq: [{ $size: "$tracks" }, 0] },
          ],
        },
      },
    },
  ]);

  const artistsToDelete = artists.map(art => art._id);
  await ArtistModel.deleteMany({ _id: { $in: artistsToDelete } });

  return { tracksToDelete, albumsToDelete, artistsToDelete };
};

export const getFirstInfo = async (userId: string) => {
  const infos = await InfosModel.find({ owner: userId })
    .sort({ played_at: "asc" })
    .limit(1);
  return infos[0];
};

export const getAllAdmins = () => UserModel.find({ admin: true });

export const setUserAdmin = (userId: string, admin: boolean) =>
  UserModel.findByIdAndUpdate(userId, { admin });

export const setUserPublicToken = (userId: string, token: string | null) =>
  UserModel.findByIdAndUpdate(userId, { publicToken: token });

export const blacklistArtist = (userId: string, artistId: string) =>
  UserModel.findByIdAndUpdate(userId, {
    $push: { "settings.blacklistedArtists": artistId },
  });

export const unblacklistArtist = (userId: string, artistId: string) =>
  UserModel.findByIdAndUpdate(userId, {
    $pull: { "settings.blacklistedArtists": artistId },
  });

export const deleteInfos = (infoIds: string[]) =>
  InfosModel.deleteMany({
    _id: { $in: infoIds.map(id => new Types.ObjectId(id)) },
  });
