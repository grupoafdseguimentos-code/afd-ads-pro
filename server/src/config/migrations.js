import { spawn } from 'node:child_process';

function shouldRunMigrations() {
  if (process.env.SKIP_AUTO_MIGRATIONS === '1') return false;
  if (!process.env.DATABASE_URL) return false;
  return process.env.NODE_ENV === 'production' || process.env.RUN_MIGRATIONS_ON_START === '1';
}

export async function runMigrationsOnStart() {
  if (!shouldRunMigrations()) {
    console.log('Prisma migrations skipped on start.');
    return;
  }

  console.log('Running Prisma migrations before mounting application routes...');

  await new Promise((resolve, reject) => {
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log('Prisma migrations applied successfully.');
        resolve();
        return;
      }

      reject(new Error(`Prisma migrate deploy exited with code ${code}`));
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
