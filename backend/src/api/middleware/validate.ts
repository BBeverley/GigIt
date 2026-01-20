import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  response?: ZodTypeAny;
};

export function validate(schemas: Schemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);

      if (schemas.response) {
        const originalJson = res.json.bind(res);
        res.json = ((data: unknown) => {
          // Only validate successful responses.
          // Error responses often have different shapes and should not explode into 500s.
          if (res.statusCode < 400) {
            const parsed = schemas.response!.parse(data);
            return originalJson(parsed);
          }
          return originalJson(data);
        }) as typeof res.json;
      }

      next();
    } catch (err) {
      res.status(400).json({ error: 'BadRequest', message: String(err) });
    }
  };
}

