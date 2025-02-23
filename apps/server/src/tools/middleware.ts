import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { verify } from "jsonwebtoken";
import { Types } from "mongoose";
import { getUserFromField, getGlobalPreferences } from "../database";
import { getUserImporterState } from "../database/queries/importer";
import { getPrivateData } from "../database/queries/privateData";
import { logger } from "./logger";
import {
  GlobalPreferencesRequest,
  LoggedRequest,
  OptionalLoggedRequest,
  SpotifyRequest,
} from "./types";
import { SpotifyAPI } from "./apis/spotifyApi";
import { httpRequestDurationNanoseconds, httpRequestsTotal } from "../metrics";
import { hrtime } from "process";

type Location = "body" | "params" | "query";

export const validating =
  (
    schema: z.AnyZodObject | z.ZodDiscriminatedUnion<any, any>,
    location: Location = "body",
  ) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const tokenObject = z.object({ token: z.string().optional() });
        let value;
        if ("merge" in schema) {
          value = schema.merge(tokenObject).parse(req[location]);
        } else {
          value = schema.and(tokenObject).parse(req[location]);
        }
        req[location] = value;
        next();
      } catch (e) {
        logger.error(e);
        res.status(400).end();
      }
    };

const baselogged = async (req: Request, useQueryToken = false) => {
  const { token: queryToken } = req.query;

  if (useQueryToken && queryToken && typeof queryToken === "string") {
    const user = await getUserFromField("publicToken", queryToken, false);
    if (user) {
      return user;
    }
  }

  const auth = req.cookies.token;
  if (!auth) {
    return null;
  }

  try {
    const privateData = await getPrivateData();
    if (!privateData?.jwtPrivateKey) {
      throw new Error("No private data found, cannot sign JWT");
    }
    const jwtUser = verify(auth, privateData.jwtPrivateKey) as {
      userId: string;
    };

    if (typeof jwtUser.userId !== "string") {
      return null;
    }

    const user = await getUserFromField(
      "_id",
      new Types.ObjectId(jwtUser.userId),
      false,
    );

    if (!user) {
      return null;
    }
    return user;
  } catch (e) {
    return null;
  }
  return null;
};

export const logged = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, false);
  if (!user) {
    res.status(401).end();
    return;
  }
  (req as LoggedRequest).user = user;
  next();
};

export const isLoggedOrGuest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, true);
  if (!user) {
    res.status(401).end();
    return;
  }
  (req as LoggedRequest).user = user;
  next();
};

export const optionalLoggedOrGuest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, true);
  (req as OptionalLoggedRequest).user = user;
  next();
};

export const optionalLogged = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, false);
  (req as OptionalLoggedRequest).user = user;
  next();
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as LoggedRequest;

  if (!user) {
    res.status(401).end();
    return;
  }

  if (!user.admin) {
    res.status(403).end();
    return;
  }
  next();
};

export const withHttpClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req as LoggedRequest;

  const client = new SpotifyAPI(user._id.toString());
  (req as SpotifyRequest & LoggedRequest).client = client;
  next();
};

export const withGlobalPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pref = await getGlobalPreferences();
    if (!pref) {
      logger.error(
        "No global preferences, this is critical, try restarting the app",
      );
      return;
    }
    (req as GlobalPreferencesRequest).globalPreferences = pref;
    next();
  } catch (e) {
    res.status(500).end();
  }
};

export const notAlreadyImporting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req as LoggedRequest;
  const imports = await getUserImporterState(user._id.toString());
  if (imports.some(imp => imp.status === "progress")) {
    res.status(400).send({ code: "ALREADY_IMPORTING" });
    return;
  }
  next();
};

export const measureRequestDuration = (endpoint: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = hrtime.bigint();
    res.on("finish", () => {
      const duration = Number(hrtime.bigint() - start);
      httpRequestDurationNanoseconds
        .labels(
          req.method,
          endpoint,
          res.statusCode.toString(),
        )
        .set(duration);
      httpRequestsTotal
        .labels(
          req.method,
          endpoint,
          res.statusCode.toString()
        )
        .inc();
    });
    next();
  };
}
