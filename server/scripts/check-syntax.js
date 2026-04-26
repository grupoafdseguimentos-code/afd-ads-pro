import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ignoredDirs = new Set(['node_modules', '.git']);
const targets = ['index.js', 'src', 'prisma'];

function listJavaScriptFiles(path) {
  const stat = statSync(path);

  if (stat.isFile()) {
    return path.endsWith('.js') ? [path] : [];
  }

  return readdirSync(path)
    .filter((entry) => !ignoredDirs.has(entry))
    .flatMap((entry) => listJavaScriptFiles(join(path, entry)));
}

const files = targets.flatMap((target) => listJavaScriptFiles(target));

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

console.log(`Server syntax OK: ${files.length} JS files`);
