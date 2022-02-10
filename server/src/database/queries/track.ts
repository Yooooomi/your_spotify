import { TrackModel } from '../Models';

export const getTrackBySpotifyId = (id: string) => TrackModel.findOne({ id });
