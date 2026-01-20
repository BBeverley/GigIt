import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  const message = err instanceof Error ? err.message : 'Unknown error';
  const status =
    typeof (err as { status?: unknown } | null)?.status === 'number'
      ? ((err as { status: number }).status)
      : 500;
  res.status(status).json({ error: status === 500 ? 'InternalServerError' : 'Error', message });
};

