import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// This prevents Next.js from creating multiple Prisma instances during development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 1. Create the native Postgres adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// 2. Pass ONLY the adapter into the Prisma Client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;