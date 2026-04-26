import { spawn } from 'node:child_process';

const shouldRun = process.env.RUN_MIGRATIONS_ON_DEPLOY === '1' || process.argv.includes('--force');

if (!shouldRun) {
  console.log('Skipping Prisma migrations during service start.');
  console.log('Run `npm run db:deploy:strict` manually after DATABASE_URL is configured.');
  process.exit(0);
}

const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error('Failed to run Prisma migrations:', error.message);
  process.exit(1);
});
