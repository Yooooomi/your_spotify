import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { logger } from "../tools/logger";
import { logged, measureRequestDuration, notAlreadyImporting, validating } from "../tools/middleware";
import { LoggedRequest, TypedPayload } from "../tools/types";
import {
  canUserImport,
  cleanupImport,
  runImporter,
} from "../tools/importers/importer";
import {
  getImporterState,
  getUserImporterState,
} from "../database/queries/importer";
import { ImporterState, ImporterStateTypes } from "../tools/importers/types";

export const router = Router();

const upload = multer({
  dest: "/tmp/imports/",
  limits: {
    files: 50,
    fileSize: 1024 * 1024 * 20, // 20 mo
  },
});

router.post(
  "/import/privacy",
  upload.array("imports", 50),
  logged,
  notAlreadyImporting,
  measureRequestDuration("/import/privacy"),
  async (req, res) => {
    const { files, user } = req as LoggedRequest;

    if (!files) {
      res.status(400).end();
      return;
    }

    if (!canUserImport(user._id.toString())) {
      res.status(400).send({ code: "ALREADY_IMPORTING" });
      return;
    }

    try {
      runImporter(
        null,
        ImporterStateTypes.privacy,
        user._id.toString(),
        (files as Express.Multer.File[]).map(f => f.path),
        success => {
          if (success) {
            res.status(200).send({ code: "IMPORT_STARTED" });
            return;
          }
          res.status(400).send({ code: "IMPORT_INIT_FAILED" });
          return;
        },
      ).catch(logger.error);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

router.post(
  "/import/full-privacy",
  upload.array("imports", 50),
  logged,
  notAlreadyImporting,
  measureRequestDuration("/import/full-privacy"),
  async (req, res) => {
    const { files, user } = req as LoggedRequest;

    if (!files) {
      res.status(400).end();
      return;
    }

    if (!canUserImport(user._id.toString())) {
      res.status(400).send({ code: "ALREADY_IMPORTING" });
      return;
    }

    try {
      runImporter(
        null,
        ImporterStateTypes.fullPrivacy,
        user._id.toString(),
        (files as Express.Multer.File[]).map(f => f.path),
        success => {
          if (success) {
            res.status(200).send({ code: "IMPORT_STARTED" });
            return;
          }
          res.status(400).send({ code: "IMPORT_INIT_FAILED" });
          return;
        },
      ).catch(logger.error);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const retrySchema = z.object({
  existingStateId: z.string(),
});

router.post(
  "/import/retry",
  validating(retrySchema),
  logged,
  notAlreadyImporting,
  measureRequestDuration("/import/retry"),
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { existingStateId } = req.body as TypedPayload<typeof retrySchema>;

    const importState =
      await getImporterState<ImporterState["type"]>(existingStateId);
    if (!importState || importState.user.toString() !== user._id.toString()) {
      res.status(404).end();
      return;
    }

    if (importState.status !== "failure") {
      res.status(400).end();
      return;
    }

    try {
      runImporter(
        importState._id.toString(),
        importState.type,
        user._id.toString(),
        importState.metadata,
        success => {
          if (success) {
            res.status(200).send({ code: "IMPORT_STARTED" });
            return;
          }
          res.status(400).send({ code: "IMPORT_INIT_FAILED" });
          return;
        },
      ).catch(logger.error);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

const cleanupImportSchema = z.object({
  id: z.string(),
});

router.delete(
  "/import/clean/:id",
  validating(cleanupImportSchema, "params"),
  logged,
  measureRequestDuration("/import/clean/:id"),
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof cleanupImportSchema>;

    try {
      const importState = await getImporterState(id);
      if (!importState) {
        res.status(404).end();
        return;
      }
      if (importState.user.toString() !== user._id.toString()) {
        res.status(404).end();
        return;
      }
      await cleanupImport(importState._id.toString());
      res.status(204).end();
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  },
);

router.get(
  "/imports",
  logged,
  measureRequestDuration("/imports"),
  async (req, res) => {
    const { user } = req as LoggedRequest;

    try {
      const state = await getUserImporterState(user._id.toString());
      res.status(200).send(state);
    } catch (e) {
      logger.error(e);
      res.status(500).end();
    }
  }
);
