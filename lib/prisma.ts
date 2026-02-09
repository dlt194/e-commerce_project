import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl =
  process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "Set TURSO_DATABASE_URL (or DATABASE_URL) in production environment variables."
  );
}

const adapter = new PrismaLibSql({
  url: databaseUrl ?? "file:./dev.db",
  authToken: tursoAuthToken,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
