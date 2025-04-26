import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { v4 } from "uuid";
import {
  admin,
  isLoggedOrGuest,
  logged,
  optionalLoggedOrGuest,
  validate,
} from "../tools/middleware";
import {
  changeSetting,
  getAllAdmins,
  getAllUsers,
  getUserFromField,
  setUserAdmin,
  setUserPublicToken,
  storeInUser,
} from "../database";
import { LoggedRequest, OptionalLoggedRequest } from "../tools/types";
import { toBoolean, toNumber } from "../tools/zod";
import { deleteUser } from "../tools/user";
import { GithubAPI } from "../tools/apis/githubApi";
import { Version } from "../tools/version";
import { getWithDefault } from "../tools/env";

export const router = Router();

router.get("/", (_, res) => {
  res.status(200).send("Hello !");
});

router.post("/logout", async (_, res) => {
  res.clearCookie("token");
  res.status(200).end();
});

const settingsSchema = z.object({
  historyLine: z.string().transform(toBoolean).optional(),
  preferredStatsPeriod: z.enum(["day", "week", "month", "year"]).optional(),
  nbElements: z.preprocess(
    toNumber,
    z.number().min(5).max(50).default(10).optional(),
  ),
  metricUsed: z.enum(["number", "duration"]).optional(),
  darkMode: z.enum(["follow", "dark", "light"]).optional(),
  timezone: z
    .string()
    .nullable()
    .transform(e => e ?? undefined)
    .optional(),
  dateFormat: z
    .string()
    .nullable()
    .transform(e => e ?? undefined)
    .optional(),
});

router.post("/settings", logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const payload = validate(req.body, settingsSchema);

  await changeSetting("_id", user._id, payload);
  res.status(200).end();
});

router.get("/me", optionalLoggedOrGuest, async (req, res) => {
  const { user } = req as OptionalLoggedRequest;
  if (user) {
    res.status(200).send({ status: true, user });
    return;
  }
  res.status(200).send({ status: false });
});

router.post("/generate-public-token", logged, async (req, res) => {
  const { user } = req as LoggedRequest;

  const token = v4();
  await setUserPublicToken(user._id.toString(), token);
  res.status(200).send(token);
});

router.post("/delete-public-token", logged, async (req, res) => {
  const { user } = req as LoggedRequest;

  await setUserPublicToken(user._id.toString(), null);
  res.status(200).end();
});

router.get("/accounts", isLoggedOrGuest, async (_, res) => {
  const users = await getAllUsers(false);
  res.status(200).send(
    users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      admin: user.admin,
      firstListenedAt: user.firstListenedAt,
    })),
  );
});

const setAdmin = z.object({
  id: z.string(),
});

const setAdminBody = z.object({
  status: z.preprocess(toBoolean, z.boolean()),
});

router.put("/admin/:id", logged, admin, async (req, res) => {
  const { id } = validate(req.params, setAdmin);
  const { status } = validate(req.body, setAdminBody);

  const users = await getAllAdmins();
  if (users.length <= 1 && status === false) {
    res.status(400).send({ code: "CANNOT_HAVE_ZERO_ADMIN" });
    return;
  }
  await setUserAdmin(id, status);
  res.status(204).end();
});

const deleteAccount = z.object({
  id: z.string(),
});

router.delete("/account/:id", logged, admin, async (req, res) => {
  const { id } = validate(req.params, deleteAccount);

  const user = await getUserFromField("_id", new Types.ObjectId(id), false);
  if (!user) {
    res.status(404).end();
    return;
  }
  await deleteUser(id);
  res.status(204).end();
});

const rename = z.object({
  newName: z.string().max(64).min(2),
});

router.put("/rename", logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { newName } = validate(req.body, rename);

  await storeInUser("_id", user._id, { username: newName });
  res.status(204).end();
});

router.get("/version", async (_, res) => {
  if (getWithDefault("NODE_ENV", "development") === "development") {
    res.status(200).send({ update: false, version: "0.1.2" });
    return;
  }
  const thisOne = Version.thisOne();
  const githubVersion = await GithubAPI.lastVersion();
  if (!githubVersion) {
    res.status(200).send({ update: false, version: thisOne.toString() });
    return;
  }
  if (githubVersion.isNewerThan(thisOne)) {
    res.status(200).send({ update: true, version: thisOne.toString() });
    return;
  }
  res.status(200).send({ update: false, version: thisOne.toString() });
});
