import { Router } from "express";
import { register } from "prom-client";
import basicAuth from "express-basic-auth";
import { get } from "../tools/env";

export const router = Router();

router.get(
  "/metrics",
  basicAuth({
    authorizer: (username: string, password: string) => {
      const expectedUsername = get("PROMETHEUS_USERNAME");
      const expectedPassword = get("PROMETHEUS_PASSWORD");

      if (!expectedUsername || !expectedPassword) {
        return false;
      }

      const userMatches = basicAuth.safeCompare(username, expectedUsername);
      const passwordMatches = basicAuth.safeCompare(password, expectedPassword);

      return userMatches && passwordMatches;
    },
  }),
  async (_, res) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch {
      res.status(500).end();
    }
  },
);
