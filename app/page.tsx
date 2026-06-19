import { ChatApp } from "@/components/chat-app";
import { isTavilyEnabled } from "@/lib/tavily/config";

export default function Home() {
  return <ChatApp webSearchAvailable={isTavilyEnabled()} />;
}
