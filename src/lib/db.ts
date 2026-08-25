import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) return undefined;

  if (envUrl.startsWith('file:')) {
    const rawPath = envUrl.replace(/^file:/, '');
    if (!path.isAbsolute(rawPath)) {
      const normalized = rawPath.replace(/^\.\//, '');
      const candidates = [
        path.resolve(process.cwd(), 'prisma', normalized.replace(/^prisma\//, '')),
        path.resolve(process.cwd(), normalized),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return `file:${candidate}`;
        }
      }

      // Default to prisma/dev.db if not found yet
      return `file:${path.resolve(process.cwd(), 'prisma', 'dev.db')}`;
    }
  }

  return envUrl;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
export default db;

