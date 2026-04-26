const isVercel = process.env.VERCEL === '1';
const isCi = process.env.CI === 'true';
const apiUrl = process.env.VITE_API_URL || '';

if ((isVercel || isCi) && !apiUrl) {
  console.error('Missing VITE_API_URL. Configure it with the Railway backend URL before deploying the frontend.');
  process.exit(1);
}

if (apiUrl && !/^https?:\/\//.test(apiUrl)) {
  console.error('VITE_API_URL must be an absolute URL, for example https://afd-ads-pro-production.up.railway.app');
  process.exit(1);
}

console.log('Frontend environment OK');
