"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessageContentProps = {
  role: "user" | "assistant" | "system";
  text: string;
};

export function ChatMessageContent({ role, text }: ChatMessageContentProps) {
  if (role === "assistant") {
    return (
      <div className="chat-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    );
  }

  return <p className="whitespace-pre-wrap">{text}</p>;
}
