import { z } from "@/lib/openapi/extend-zod";

export const ConversationDirectorySchema = z
  .object({
    id: z.string(),
    conversationId: z.string(),
    path: z.string(),
    name: z.string(),
    createdAt: z.string(),
  })
  .openapi("ConversationDirectory");

export const ConversationDirectoryListSchema = z
  .array(ConversationDirectorySchema)
  .openapi("ConversationDirectoryList");

export const AddDirectoryBodySchema = z
  .object({
    path: z.string(),
  })
  .openapi("AddDirectoryBody");

export const DirectoryTreeNodeSchema = z
  .object({
    name: z.string(),
    path: z.string(),
    type: z.enum(["directory", "file"]),
  })
  .openapi("DirectoryTreeNode");

export const DirectoryTreeResponseSchema = z
  .object({
    rootPath: z.string(),
    relativePath: z.string(),
    nodes: z.array(DirectoryTreeNodeSchema),
  })
  .openapi("DirectoryTreeResponse");

export const DirectoryFileEntrySchema = z
  .object({
    path: z.string(),
    name: z.string(),
  })
  .openapi("DirectoryFileEntry");

export const DirectoryFilesResponseSchema = z
  .object({
    rootPath: z.string(),
    relativePath: z.string(),
    files: z.array(DirectoryFileEntrySchema),
  })
  .openapi("DirectoryFilesResponse");

export const PickedDirectorySchema = z
  .object({
    path: z.string(),
    name: z.string(),
  })
  .openapi("PickedDirectory");

export type ConversationDirectory = z.infer<typeof ConversationDirectorySchema>;
export type DirectoryTreeNode = z.infer<typeof DirectoryTreeNodeSchema>;
export type DirectoryTreeResponse = z.infer<typeof DirectoryTreeResponseSchema>;
export type DirectoryFilesResponse = z.infer<typeof DirectoryFilesResponseSchema>;
export type PickedDirectory = z.infer<typeof PickedDirectorySchema>;
