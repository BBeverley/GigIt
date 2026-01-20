import express from 'express';

import { createApiRouter } from './api';
import { errorHandler } from './api/middleware/error';
import { requestLogger } from './api/middleware/requestLogger';

export function createApp() {
  const app = express();
  app.use(requestLogger);
  app.use(express.json());

  // Keep a simple non-versioned health check for local smoke tests.
  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/v1', createApiRouter());

  app.use(errorHandler);
  return app;
}

