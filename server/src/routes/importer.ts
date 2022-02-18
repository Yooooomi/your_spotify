import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { logger } from '../tools/logger';
import { logged, validating } from '../tools/middleware';
import { LoggedRequest, TypedPayload } from '../tools/types';
import { canUserImport, getImport, runImporter } from '../tools/importers/importer';

const router = Router();
export default router;

const upload = multer({
  dest: '/tmp/imports/',
  limits: {
    files: 50,
    fileSize: 1024 * 1024 * 10, // 10 mo
  },
});

const importSchema = z.object({
  importerName: z.enum(['privacy']),
});

router.post(
  '/import',
  upload.array('imports', 50),
  validating(importSchema),
  logged,
  async (req, res) => {
    const { importerName } = req.body as TypedPayload<typeof importSchema>;
    const { files, user } = req as LoggedRequest;

    if (!files) {
      return res.status(400).end();
    }

    if (!canUserImport(user._id.toString())) {
      return res.status(400).send({ code: 'ALREADY_IMPORTING' });
    }

    try {
      runImporter(
        importerName,
        user,
        (files as Express.Multer.File[]).map((f) => f.path),
        (success) => {
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

router.get('/import', logged, async (req, res) => {
  const { user } = req as LoggedRequest;

  try {
    const importer = getImport(user._id.toString());
    if (!importer) {
      return res.status(200).send({ running: false });
    }
    return res.status(200).send({ running: true, progress: importer.getProgress() });
  } catch (e) {
    logger.error(e);
  }
});
