import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    // Keep log format stable and single-line (useful for grep and CI).
    // Example: "GET /api/v1/jobs 200 12ms"
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
};

