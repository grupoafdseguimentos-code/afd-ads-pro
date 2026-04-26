import express from 'express';

export const app = express();

let applicationMounted = false;

app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.status(200).send('A.F.D Ads Pro API online');
});

app.get('/api/health', (req, res) => {
  res.status(200).type('text/plain').send('ok');
});

app.get('/api/ready', async (req, res) => {
  try {
    const { getDatabaseStatus } = await import('./config/prisma.js');
    const database = await getDatabaseStatus();

    return res.status(database.ok ? 200 : 503).json({
      status: database.ok ? 'ok' : 'unavailable',
      database: database.ok ? 'connected' : 'unavailable',
      code: database.code,
      message: database.message,
      target: database.target
    });
  } catch (error) {
    console.error('Readiness check failed:', error.message);
    return res.status(503).json({
      status: 'unavailable',
      database: 'unavailable',
      code: 'READY_CHECK_FAILED',
      message: 'Falha ao testar o banco.'
    });
  }
});

export async function mountApplication() {
  if (applicationMounted) return;

  const [
    cookieParserModule,
    corsModule,
    rateLimitModule,
    helmetModule,
    morganModule,
    envModule,
    errorModule,
    routesModule
  ] = await Promise.all([
    import('cookie-parser'),
    import('cors'),
    import('express-rate-limit'),
    import('helmet'),
    import('morgan'),
    import('./config/env.js'),
    import('./middlewares/error.js'),
    import('./routes.js')
  ]);

  const cookieParser = cookieParserModule.default;
  const cors = corsModule.default;
  const rateLimit = rateLimitModule.default;
  const helmet = helmetModule.default;
  const morgan = morganModule.default;
  const { env } = envModule;
  const { errorHandler, notFound } = errorModule;
  const { routes } = routesModule;

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || !env.CLIENT_URL || origin === env.CLIENT_URL) {
        return callback(null, true);
      }

      if (env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error('Origem nao permitida pelo CORS.'));
    },
    credentials: true
  }));
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

  applicationMounted = true;
}
