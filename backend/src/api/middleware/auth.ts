import type { RequestHandler } from 'express';

import { buildRequestContext } from '../../auth/requestContext';
import { provisionUser } from '../../domain/users/provisionUser';

function extractBearerToken(value: string | undefined) {
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value);
  return match?.[1] ?? null;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.header('authorization'));
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    req.currentUser = await buildRequestContext(token);

    // US1 requirement: auto-provision user record on first request.
    await provisionUser({
      userId: req.currentUser.userId,
      email: req.currentUser.email,
      displayName: req.currentUser.displayName,
    });

    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

