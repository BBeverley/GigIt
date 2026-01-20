import express from 'express';

export function createHealthRouter() {
  const router = express.Router();
  router.get('/', (_req, res) => {
    res.json({ ok: true });
  });
  return router;
}

