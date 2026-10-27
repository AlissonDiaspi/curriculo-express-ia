
import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import type {
  Request,
  Response,
  NextFunction,
} from 'express';

export function configureHttp(
  app: INestApplication,
): void {
  const allowedOrigin =
    process.env.FRONTEND_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  app.use(cookieParser());

  app.use(
    (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const unsafeMethods = [
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
      ];

      if (!unsafeMethods.includes(req.method)) {
        return next();
      }

      const origin = req.headers.origin;

      if (origin) {
        if (origin !== allowedOrigin) {
          return res.status(403).json({
            message: 'Origem não permitida.',
          });
        }

        return next();
      }

      const referer = req.headers.referer;

      if (referer) {
        try {
          if (
            new URL(referer).origin === allowedOrigin
          ) {
            return next();
          }
        } catch {
          // Referer inválido.
        }

        return res.status(403).json({
          message: 'Origem não permitida.',
        });
      }

      return res.status(403).json({
        message: 'Origem não informada.',
      });
    },
  );

  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PATCH',
      'OPTIONS',
    ],
    allowedHeaders: ['Content-Type'],
  });
}
