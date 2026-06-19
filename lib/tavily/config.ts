export function isTavilyEnabled(): boolean {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}
