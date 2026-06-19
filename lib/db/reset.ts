import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import {
  conversationDirectories,
  conversations,
  messages,
  ragChunks,
  ragDocuments,
} from "@/lib/db/schema";
import type * as schema from "@/lib/db/schema";

export async function resetDatabase(
  database: BetterSQLite3Database<typeof schema>,
): Promise<void> {
  await database.delete(ragChunks);
  await database.delete(ragDocuments);
  await database.delete(conversationDirectories);
  await database.delete(messages);
  await database.delete(conversations);
}
