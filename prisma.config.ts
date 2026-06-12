import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Force the Prisma CLI to explicitly read the .env file
config(); 

export default defineConfig({
  // NEW: Tell Prisma V7 how to run your seed script
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});