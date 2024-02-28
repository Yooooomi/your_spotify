import { Schema, Types } from "mongoose";

export interface Infos {
  owner: Types.ObjectId;
  id: string;
  albumId: string;
  primaryArtistId: string;
  artistIds: string[];
  durationMs: number;
  played_at: Date;
  blacklistedBy?: "artist";
}

export const InfosSchema = new Schema<Infos>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User" },

    id: { type: String, index: true },
    albumId: { type: String, index: true },
    primaryArtistId: { type: String, index: true },
    artistIds: [{ type: String }],

    durationMs: { type: Number },

    played_at: { type: Date, index: true },
    blacklistedBy: {
      type: [String],
      enum: ["artist"],
      required: false,
      default: undefined,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

InfosSchema.virtual("track", {
  ref: "Track",
  localField: "id",
  foreignField: "id",
  justOne: true,
});

InfosSchema.virtual("album", {
  ref: "Album",
  localField: "albumId",
  foreignField: "id",
  justOne: true,
});

InfosSchema.virtual("artist", {
  ref: "Artist",
  localField: "primaryArtistId",
  foreignField: "id",
  justOne: true,
});
