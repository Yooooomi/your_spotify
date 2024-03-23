import { generateRandomString } from "../../tools/crypto";
import { PrivateDataModel } from "../Models";

export async function createPrivateData() {
  await PrivateDataModel.create({ jwtPrivateKey: generateRandomString(32) });
}

export async function getPrivateData() {
  return PrivateDataModel.findOne({});
}
