import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getChatModel } from "@/lib/ai/models";
import { buildSystemPrompt } from "@/lib/chat/build-system-prompt";
import { getLastUserMessageText } from "@/lib/chat/get-last-user-message-text";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { isDefaultConversationTitle } from "@/lib/i18n/server";
import { parseJsonBody } from "@/lib/openapi/parse";
import { prepareRagContext } from "@/lib/rag/prepare-context";
import type { RagSource } from "@/lib/rag/types";
import { isTavilyEnabled } from "@/lib/tavily/config";
import { getTavilyChatTools } from "@/lib/tavily/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const ChatRequestBodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  conversationId: z.string().optional(),
  checkedFileKeys: z.array(z.string()).optional(),
  webSearch: z.boolean().optional(),
});

export async function POST(req: Request) {
  const body = await parseJsonBody(req, ChatRequestBodySchema);
  if (!body.success) {
    return body.response;
  }

  const {
    messages: uiMessages,
    conversationId,
    checkedFileKeys = [],
    webSearch = true,
  } = body.data;
  const userText = getLastUserMessageText(uiMessages);
  const webSearchEnabled = webSearch && isTavilyEnabled();
  const tavilyTools = webSearchEnabled ? getTavilyChatTools() : undefined;

  let ragContext: string | null = null;
  let ragSources: RagSource[] = [];

  if (
    process.env.VERCEL !== "1" &&
    conversationId &&
    checkedFileKeys.length > 0 &&
    userText.trim()
  ) {
    try {
      const ragResult = await prepareRagContext({
        conversationId,
        checkedFileKeys,
        query: userText,
      });

      ragContext = ragResult?.context ?? null;
      ragSources = ragResult?.sources ?? [];
    } catch (error) {
      console.error("[chat] Failed to prepare RAG context", {
        conversationId,
        checkedFileKeys,
        error,
      });
    }
  }

  const result = streamText({
    model: getChatModel(),
    system: buildSystemPrompt({
      ragContext,
      webSearchEnabled,
    }),
    messages: await convertToModelMessages(uiMessages),
    ...(tavilyTools
      ? {
          tools: tavilyTools,
          stopWhen: stepCountIs(5),
        }
      : {}),
    onFinish: async ({ text }) => {
      if (!conversationId) {
        return;
      }

      if (userText) {
        await db.insert(messages).values({
          id: crypto.randomUUID(),
          conversationId,
          role: "user",
          content: userText,
        });

        const conversationRows = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId));

        const conversation = conversationRows.at(0);
        if (conversation && isDefaultConversationTitle(conversation.title)) {
          await db
            .update(conversations)
            .set({ title: userText.slice(0, 50) })
            .where(eq(conversations.id, conversationId));
        }
      }

      if (text) {
        await db.insert(messages).values({
          id: crypto.randomUUID(),
          conversationId,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish" && ragSources.length > 0) {
        return { ragSources };
      }

      return undefined;
    },
  });
}
