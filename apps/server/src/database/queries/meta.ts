import mongoose from "mongoose";
import { MongoInfos } from "./meta.types";

export async function getMongoInfos(): Promise<MongoInfos> {
  const admin = mongoose.connection.db.admin();
  const infos = await admin.buildInfo();
  return infos as MongoInfos;
}

export async function getCompatibilityVersion(): Promise<{
  featureCompatibilityVersion: { version: string };
  ok: number;
}> {
  const admin = mongoose.connection.db.admin();
  const compat = await admin.command({
    getParameter: 1,
    featureCompatibilityVersion: 1,
  });
  return compat as {
    featureCompatibilityVersion: { version: string };
    ok: number;
  };
}

export async function setFeatureCompatibilityVersion(version: string) {
  const admin = mongoose.connection.db.admin();
  await admin.command({ setFeatureCompatibilityVersion: version });
}
