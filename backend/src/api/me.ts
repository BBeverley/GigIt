import express from 'express';

import { provisionUser } from '../domain/users/provisionUser';
import { validate } from './middleware/validate';
import { MeResponseSchema } from '@gigit/shared';

export function createMeRouter() {
  const router = express.Router();

  router.get('/', validate({ response: MeResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

      const user = await provisionUser({
        userId: req.currentUser.userId,
        email: req.currentUser.email,
        displayName: req.currentUser.displayName,
      });

      res.json({
        user: {
          userId: user.user_id,
          email: user.email ?? undefined,
          displayName: user.display_name ?? undefined,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

