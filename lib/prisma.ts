import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('DATABASE_URL is not configured');
      },
    });
  }

  return globalForPrisma.prisma ?? new PrismaClient();
}

export const prisma = createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
