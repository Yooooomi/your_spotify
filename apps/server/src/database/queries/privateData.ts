import { randomUUID } from "crypto";
import { PrivateDataModel } from "../Models";

export async function createPrivateData() {
  await PrivateDataModel.create({ jwtPrivateKey: randomUUID() });
}

export async function getPrivateData() {
  return PrivateDataModel.findOne({});
}
