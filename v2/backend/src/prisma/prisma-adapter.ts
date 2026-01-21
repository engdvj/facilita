import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isUserMode } from '../common/app-mode';

let pool: Pool | null = null;

export function createPrismaAdapter() {
  const fallbackUrl = process.env.DATABASE_URL;
  const connectionString = isUserMode()
    ? process.env.DATABASE_URL_USER || fallbackUrl
    : process.env.DATABASE_URL_COMPANY || fallbackUrl;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return new PrismaPg(pool);
}
