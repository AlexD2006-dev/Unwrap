import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "";
const isTestEnvironment = process.env.NODE_ENV === "test";

const getDatabaseName = (connectionString: string): string => {
  try {
    return (
      new URL(connectionString).pathname
        .replace(/^\/+/, "")
        .split("?")[0] ?? ""
    );
  } catch {
    return "";
  }
};

// Prevent tests from ever connecting to the development database.
if (isTestEnvironment && getDatabaseName(databaseUrl) !== "unwrap_test") {
  throw new Error(
    "Refusing to run tests: DATABASE_URL must point to the unwrap_test database.",
  );
}

const prisma = new PrismaClient();

export default prisma;