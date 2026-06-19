import { getTestDb } from "@/lib/db/vitest-mock";
import {
  conversationDirectories,
  conversations,
  messages,
} from "@/lib/db/schema";

export async function seedConversation(
  title = "Test conversation",
  options?: { pinned?: boolean },
) {
  const { db } = getTestDb();
  const id = crypto.randomUUID();

  await db.insert(conversations).values({
    id,
    title,
    pinned: options?.pinned ?? false,
  });

  return { id, title };
}

export async function seedMessage(
  conversationId: string,
  content: string,
  role: "user" | "assistant" | "system" = "user",
) {
  const { db } = getTestDb();
  const id = crypto.randomUUID();

  await db.insert(messages).values({
    id,
    conversationId,
    role,
    content,
  });

  return { id, conversationId, role, content };
}

export async function seedDirectory(
  conversationId: string,
  directoryPath: string,
  name?: string,
) {
  const { db } = getTestDb();
  const id = crypto.randomUUID();

  await db.insert(conversationDirectories).values({
    id,
    conversationId,
    path: directoryPath,
    name: name ?? directoryPath.split("/").pop() ?? directoryPath,
  });

  return { id, conversationId, path: directoryPath };
}
