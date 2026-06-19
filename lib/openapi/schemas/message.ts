import { z } from "@/lib/openapi/extend-zod";

export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);

export const StoredMessageSchema = z
  .object({
    id: z.string(),
    conversationId: z.string(),
    role: MessageRoleSchema,
    content: z.string(),
    createdAt: z.string(),
  })
  .openapi("StoredMessage");

export const StoredMessageListSchema = z
  .array(StoredMessageSchema)
  .openapi("StoredMessageList");

export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type StoredMessage = z.infer<typeof StoredMessageSchema>;
