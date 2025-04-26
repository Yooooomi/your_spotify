import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { logger } from "../tools/logger";
import { logged, notAlreadyImporting, validate } from "../tools/middleware";
import { LoggedRequest } from "../tools/types";
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
  },
);

router.post(
  "/import/full-privacy",
  upload.array("imports", 50),
  logged,
  notAlreadyImporting,
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
  },
);

const retrySchema = z.object({
  existingStateId: z.string(),
});

router.post("/import/retry", logged, notAlreadyImporting, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { existingStateId } = validate(req.body, retrySchema);

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
});

const cleanupImportSchema = z.object({
  id: z.string(),
});

router.delete("/import/clean/:id", logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { id } = validate(req.params, cleanupImportSchema);

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
});

router.get("/imports", logged, async (req, res) => {
  const { user } = req as LoggedRequest;

  const state = await getUserImporterState(user._id.toString());
  res.status(200).send(state);
});
