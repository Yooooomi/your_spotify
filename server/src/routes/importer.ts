import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { logger } from '../tools/logger';
import { logged, notAlreadyImporting, validating } from '../tools/middleware';
import { LoggedRequest, TypedPayload } from '../tools/types';
import {
  canUserImport,
  cleanupImport,
  runImporter,
} from '../tools/importers/importer';
import {
  getImporterState,
  getUserImporterState,
} from '../database/queries/importer';
import { ImporterState, ImporterStateTypes } from '../tools/importers/types';

const router = Router();
export default router;

const upload = multer({
  dest: '/tmp/imports/',
  limits: {
    files: 50,
    fileSize: 1024 * 1024 * 20, // 20 mo
  },
});

router.post(
  '/import/privacy',
  upload.array('imports', 50),
  logged,
  notAlreadyImporting,
  async (req, res) => {
    const { files, user } = req as LoggedRequest;

    if (!files) {
      return res.status(400).end();
    }

    if (!canUserImport(user._id.toString())) {
      return res.status(400).send({ code: 'ALREADY_IMPORTING' });
    }

    try {
      runImporter(
        null,
        ImporterStateTypes.privacy,
        user,
        (files as Express.Multer.File[]).map(f => f.path),
        success => {
          if (success) {
            return res.status(200).send({ code: 'IMPORT_STARTED' });
          }
          return res.status(400).send({ code: 'IMPORT_INIT_FAILED' });
        },
      ).catch(logger.error);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.post(
  '/import/full-privacy',
  upload.array('imports', 50),
  logged,
  notAlreadyImporting,
  async (req, res) => {
    const { files, user } = req as LoggedRequest;

    if (!files) {
      return res.status(400).end();
    }

    if (!canUserImport(user._id.toString())) {
      return res.status(400).send({ code: 'ALREADY_IMPORTING' });
    }

    try {
      runImporter(
        null,
        ImporterStateTypes.fullPrivacy,
        user,
        (files as Express.Multer.File[]).map(f => f.path),
        success => {
          if (success) {
            return res.status(200).send({ code: 'IMPORT_STARTED' });
          }
          return res.status(400).send({ code: 'IMPORT_INIT_FAILED' });
        },
      ).catch(logger.error);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const retrySchema = z.object({
  existingStateId: z.string(),
});

router.post(
  '/import/retry',
  validating(retrySchema),
  logged,
  notAlreadyImporting,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { existingStateId } = req.body as TypedPayload<typeof retrySchema>;

    const importState = await getImporterState<ImporterState['type']>(
      existingStateId,
    );
    if (!importState || importState.user.toString() !== user._id.toString()) {
      return res.status(404).end();
    }

    if (importState.status !== 'failure') {
      return res.status(400).end();
    }

    try {
      runImporter(
        importState._id.toString(),
        importState.type,
        user,
        importState.metadata,
        success => {
          if (success) {
            return res.status(200).send({ code: 'IMPORT_STARTED' });
          }
          return res.status(400).send({ code: 'IMPORT_INIT_FAILED' });
        },
      ).catch(logger.error);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const cleanupImportSchema = z.object({
  id: z.string(),
});

router.delete(
  '/import/clean/:id',
  validating(cleanupImportSchema, 'params'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof cleanupImportSchema>;

    try {
      const importState = await getImporterState(id);
      if (!importState) {
        return res.status(404).end();
      }
      if (importState.user.toString() !== user._id.toString()) {
        return res.status(404).end();
      }
      await cleanupImport(importState._id.toString());
      return res.status(204).end();
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get('/imports', logged, async (req, res) => {
  const { user } = req as LoggedRequest;

  try {
    const state = await getUserImporterState(user._id.toString());
    return res.status(200).send(state);
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});
