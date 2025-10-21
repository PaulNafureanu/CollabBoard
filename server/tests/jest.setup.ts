import dotenvFlow from "dotenv-flow";
import path from "node:path";

// Force dotenv-flow to read from the server/ folder and the test env set
dotenvFlow.config({
  node_env: "test",
  path: path.resolve(__dirname, ".."), // => server/
  silent: true,
});

import { execSync } from "node:child_process";
import { prisma } from "../src/db/prisma";

beforeAll(async () => {
  // Apply migrations to the *test* DB; pass our env explicitly to child process
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env },
  });
  await prisma.$queryRaw`SELECT 1`;
});

afterEach(async () => {
  // Truncate all tables (except migrations), reset identities, cascade
  await prisma.$executeRawUnsafe(`
    DO
    $do$
    DECLARE r RECORD;
    BEGIN
      EXECUTE 'SET session_replication_role = replica';
      FOR r IN
        SELECT tablename FROM pg_tables
        WHERE schemaname='public' AND tablename <> '_prisma_migrations'
      LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
      END LOOP;
      EXECUTE 'SET session_replication_role = DEFAULT';
    END
    $do$;
  `);
});

afterAll(async () => {
  await prisma.$disconnect();
});
