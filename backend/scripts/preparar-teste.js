import { execSync } from 'node:child_process';

if (!process.env.DATABASE_URL?.includes('_test')) {
  console.error('DATABASE_URL de teste deve apontar para um banco com "_test" no nome.');
  process.exit(1);
}
execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
