import express from 'express';
import crypto from 'crypto';

import {
  CreateJobFileUploadRequestSchema,
  DownloadUrlResponseSchema,
  InitiateUploadResponseSchema,
  JobFilesListResponseSchema,
} from '@gigit/shared';

import { validate } from './middleware/validate';
import {
  createFileMetadata,
  getJobFile,
  listJobFiles,
  softDeleteFile,
  type FileArea,
} from '../domain/files/jobFilesService';
import { LocalStorageProvider } from '../files/localStorageProvider';
import { writeAuditEvent } from '../domain/audit/auditService';

const storage = new LocalStorageProvider();

export function createJobFilesRouter() {
  const router = express.Router({ mergeParams: true });

  type Params = { jobId?: string; fileId?: string };
  function paramsOf(req: express.Request): Params {
    return req.params as unknown as Params;
  }

  router.get('/', validate({ response: JobFilesListResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
      const { jobId } = paramsOf(req);
      if (!jobId) return res.status(400).json({ error: 'BadRequest' });

      const area = typeof req.query.area === 'string' ? (req.query.area as FileArea) : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;

      const result = await listJobFiles({ currentUser: req.currentUser, jobId, area, category });
      if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });

      res.json({ files: result.files.map(mapFile) });
    } catch (err) {
      next(err);
    }
  });

  router.post(
    '/initiate-upload',
    validate({ body: CreateJobFileUploadRequestSchema, response: InitiateUploadResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
        const { jobId } = paramsOf(req);
        if (!jobId) return res.status(400).json({ error: 'BadRequest' });

        const fileId = crypto.randomUUID();
        const safeName = req.body.originalFileName.replace(/[^a-zA-Z0-9._-]+/g, '_');
        const objectKey = `jobs/${jobId}/${fileId}-${safeName}`;

        const meta = await createFileMetadata({
          currentUser: req.currentUser,
          jobId,
          area: req.body.area,
          category: req.body.category,
          originalFileName: req.body.originalFileName,
          mimeType: req.body.mimeType,
          sizeBytes: req.body.sizeBytes,
          storageObjectKey: objectKey,
        });

        if (meta.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });

        const signed = await storage.getSignedUploadUrl({
          objectKey,
          contentType: req.body.mimeType,
          contentLength: req.body.sizeBytes,
        });

        await writeAuditEvent({
          jobId,
          actorUserId: req.currentUser.userId,
          eventType: 'FileUploaded',
          summary: `File uploaded: ${req.body.originalFileName}`,
        });

        res.json({
          file: mapFile(meta.file),
          upload: signed,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/:fileId/download-url',
    validate({ response: DownloadUrlResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
        const { jobId, fileId } = paramsOf(req);
        if (!jobId || !fileId) return res.status(400).json({ error: 'BadRequest' });

        const fileRes = await getJobFile({ currentUser: req.currentUser, jobId, fileId });
        if (fileRes.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
        if (fileRes.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });

        const signed = await storage.getSignedDownloadUrl({
          objectKey: fileRes.file.storage_object_key,
          fileName: fileRes.file.original_file_name,
        });

        res.json({ download: signed });
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete('/:fileId', async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
      const { jobId, fileId } = paramsOf(req);
      if (!jobId || !fileId) return res.status(400).json({ error: 'BadRequest' });

      const del = await softDeleteFile({ currentUser: req.currentUser, jobId, fileId });
      if (del.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
      if (del.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });

      await storage.deleteObject({ objectKey: del.file.storage_object_key });
      await writeAuditEvent({
        jobId,
        actorUserId: req.currentUser.userId,
        eventType: 'FileDeleted',
        summary: `File deleted: ${del.file.original_file_name}`,
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

type DbFileRow = {
  file_id: string;
  job_id: string;
  area: string;
  category: string;
  original_file_name: string;
  mime_type: string;
  size_bytes: number | string | bigint;
  uploaded_by_user_id: string;
  uploaded_at: string | Date;
};

function mapFile(f: DbFileRow) {
  return {
    fileId: f.file_id,
    jobId: f.job_id,
    area: f.area,
    category: f.category,
    originalFileName: f.original_file_name,
    mimeType: f.mime_type,
    sizeBytes: typeof f.size_bytes === 'bigint' ? Number(f.size_bytes) : Number(f.size_bytes),
    uploadedByUserId: f.uploaded_by_user_id,
    uploadedAt: f.uploaded_at instanceof Date ? f.uploaded_at.toISOString() : f.uploaded_at,
  };
}
