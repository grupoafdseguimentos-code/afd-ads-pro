import express from 'express';

export const app = express();

let applicationMounted = false;

app.set('trust proxy', 1);

const fallbackAllowedOrigins = [
  'https://afd-ads-pro-client.vercel.app'
];

function getAllowedOrigins() {
  const configured = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
  ]
    .filter(Boolean)
    .flatMap(value => String(value).split(','))
    .map(value => value.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return Array.from(new Set([...fallbackAllowedOrigins, ...configured]));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalized = String(origin).replace(/\/+$/, '');
  if (getAllowedOrigins().includes(normalized)) return true;

  return /^https:\/\/afd-ads-pro-client(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(normalized);
}

function applyCorsHeaders(req, res, next) {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  return next();
}

app.use(applyCorsHeaders);

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
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      if (env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error('Origem nao permitida pelo CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
