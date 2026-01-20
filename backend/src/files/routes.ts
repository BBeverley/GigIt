import express from 'express';

import { LocalStorageProvider } from './localStorageProvider';
import { verifyPayload } from './signedUrlService';

export function createSignedFilesRouter() {
  const router = express.Router();

  // Signed upload endpoint (local/dev): PUT bytes directly.
  router.put('/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
    const payload = typeof req.query.payload === 'string' ? req.query.payload : undefined;
    const sig = typeof req.query.sig === 'string' ? req.query.sig : undefined;
    if (!payload || !sig) return res.status(400).json({ error: 'BadRequest' });

    const decoded = verifyPayload({ payload, sig });
    if (!decoded || decoded.action !== 'upload') return res.status(403).json({ error: 'Forbidden' });

    const bytes = Buffer.isBuffer(req.body) ? (req.body as Buffer) : Buffer.from([]);
    LocalStorageProvider.writeObject(decoded.objectKey, bytes);
    res.status(204).send();
  });

  router.get('/download', (req, res) => {
    const payload = typeof req.query.payload === 'string' ? req.query.payload : undefined;
    const sig = typeof req.query.sig === 'string' ? req.query.sig : undefined;
    const name = typeof req.query.name === 'string' ? req.query.name : 'download.bin';
    if (!payload || !sig) return res.status(400).json({ error: 'BadRequest' });

    const decoded = verifyPayload({ payload, sig });
    if (!decoded || decoded.action !== 'download') return res.status(403).json({ error: 'Forbidden' });

    try {
      const bytes = LocalStorageProvider.readObject(decoded.objectKey);
      const safeName = name.replace(/"/g, '');
      res.setHeader('content-disposition', `attachment; filename="${safeName}"`);
      res.status(200).send(bytes);
    } catch {
      res.status(404).json({ error: 'NotFound' });
    }
  });

  return router;
}

