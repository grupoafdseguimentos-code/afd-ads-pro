const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const required = [
  'client/src/App.jsx',
  'client/src/pages/DashboardPage.jsx',
  'client/src/pages/BillingPage.jsx',
  'client/src/pages/LoginPage.jsx',
  'client/src/pages/ResetPasswordPage.jsx',
  'client/src/layouts/AppLayout.jsx',
  'client/vercel.json',
  'server/src/server.js',
  'server/src/modules/auth/auth.routes.js',
  'server/src/modules/billing/billing.routes.js',
  'server/src/modules/metrics/metrics.routes.js',
  'server/prisma/schema.prisma',
  'server/prisma/seed.js',
  'server/render.yaml',
  'server/railway.json'
];

const missing = required.filter(file => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error('Missing files:');
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log(`A.F.D Ads Pro SaaS structure OK: ${required.length} required files`);
