import { z } from "@/lib/openapi/extend-zod";

export const ConversationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    pinned: z.boolean(),
    createdAt: z.string(),
  })
  .openapi("Conversation");

export const ConversationListSchema = z
  .array(ConversationSchema)
  .openapi("ConversationList");

export const CreateConversationBodySchema = z
  .object({
    title: z.string().optional(),
  })
  .openapi("CreateConversationBody");

export const UpdateConversationBodySchema = z
  .object({
    title: z.string().optional(),
    pinned: z.boolean().optional(),
  })
  .openapi("UpdateConversationBody");

export type Conversation = z.infer<typeof ConversationSchema>;
export type CreateConversationBody = z.infer<
  typeof CreateConversationBodySchema
>;
export type UpdateConversationBody = z.infer<
  typeof UpdateConversationBodySchema
>;
