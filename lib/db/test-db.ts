import { applySchema } from "@/lib/db/apply-schema";
import { createDb, type DbConnection } from "@/lib/db/create-db";

export type TestDb = DbConnection & {
  close: () => void;
};

export function createTestDb(): TestDb {
  const connection = createDb(":memory:");
  applySchema(connection.sqlite);

  return {
    ...connection,
    close: () => {
      connection.sqlite.close();
    },
  };
}
