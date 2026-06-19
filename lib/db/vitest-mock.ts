import { beforeEach, afterEach, vi } from "vitest";

import { createTestDb, type TestDb } from "@/lib/db/test-db";

const testDbRef = vi.hoisted(() => ({
  current: null as TestDb | null,
}));

vi.mock("@/lib/db", () => ({
  get db() {
    if (!testDbRef.current) {
      throw new Error("Test database is not initialized. Did you forget setupTestDb()?");
    }
    return testDbRef.current.db;
  },
  get sqlite() {
    if (!testDbRef.current) {
      throw new Error("Test database is not initialized. Did you forget setupTestDb()?");
    }
    return testDbRef.current.sqlite;
  },
}));

export function setupTestDb(): void {
  beforeEach(() => {
    testDbRef.current?.close();
    testDbRef.current = createTestDb();
  });

  afterEach(() => {
    testDbRef.current?.close();
    testDbRef.current = null;
  });
}

export function getTestDb(): TestDb {
  if (!testDbRef.current) {
    throw new Error("Test database is not initialized.");
  }
  return testDbRef.current;
}
