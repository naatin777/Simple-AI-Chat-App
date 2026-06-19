import type { UIMessage } from "ai";

export function getLastUserMessageText(uiMessages: UIMessage[]): string {
  const lastUserMessage = [...uiMessages]
    .reverse()
    .find((message) => message.role === "user");

  return (
    lastUserMessage?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("") ?? ""
  );
}
