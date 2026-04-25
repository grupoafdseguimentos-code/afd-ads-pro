import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { routes } from './routes.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60 * 1000, max: 180 }));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/billing/webhook')) {
    return express.raw({ type: 'application/json' })(req, res, next);
  }
  return express.json({ limit: '2mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
