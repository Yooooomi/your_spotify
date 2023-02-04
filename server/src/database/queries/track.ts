import { AlbumModel, InfosModel, TrackModel } from '../Models';

export const getTrackBySpotifyId = (id: string) => TrackModel.findOne({ id });

export const unblacklistByArtist = async (userId: string, artistId: string) => {
  const albums = await AlbumModel.find({ 'artists.0': artistId });
  const albumIds = albums.map(alb => alb.id);
  const tracks = await TrackModel.find({ album: { $in: albumIds } });
  const trackIds = tracks.map(t => t.id);
  await InfosModel.updateMany(
    {
      owner: userId,
      id: { $in: trackIds },
      blacklistedBy: { $elemMatch: { $eq: 'artist' } },
    },
    { $pull: { blacklistedBy: 'artist' } },
  );
  await InfosModel.updateMany(
    {
      owner: userId,
      blacklistedBy: { $size: 0 },
    },
    {
      $unset: { blacklistedBy: 1 },
    },
  );
};

export const blacklistByArtist = async (userId: string, artistId: string) => {
  const albums = await AlbumModel.find({ 'artists.0': artistId });
  const albumIds = albums.map(alb => alb.id);
  const tracks = await TrackModel.find({ album: { $in: albumIds } });
  const trackIds = tracks.map(t => t.id);
  return InfosModel.updateMany(
    {
      owner: userId,
      id: { $in: trackIds },
    },
    { $addToSet: { blacklistedBy: 'artist' } },
  );
};
