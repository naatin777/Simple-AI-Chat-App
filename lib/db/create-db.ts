import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

export interface DbConnection {
  sqlite: Database.Database;
  db: ReturnType<typeof drizzle<typeof schema>>;
}

export function createDb(databaseUrl: string): DbConnection {
  const sqlite = new Database(databaseUrl);
  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}
