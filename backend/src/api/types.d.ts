import type { CurrentUser } from '../auth/requestContext';

declare global {
  namespace Express {
    interface Request {
      currentUser?: CurrentUser;
    }
  }
}

export {};

