import { Schema } from "mongoose";

export interface PrivateData {
  jwtPrivateKey: string;
}

export const PrivateDataSchema = new Schema<PrivateData>({
  jwtPrivateKey: String,
});
